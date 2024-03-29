# Primary Picture Service

# Maintaining an up to date copy while not bogging down the system

## Problem Statement

### Requirements:
1. broadcast update
2. add client
3. remove client
4. write picture periodically
5. pictures are stored in s3

### Constraints:
* broadcast updates in order that they are received
* broadcast updates from any client in the order that that particular client sent them
* can add clients
** when a client is added, it is synchronized, where synchronized means that after some time,
*** it will be receiving the same update stream as previously registered clients
*** once those updates are applied, it has the same picture
* can remove a client
* picture is written:
** periodically
** upon the last client leaving

^^ this is it, just solve it, deploy it, and scale it

## Current situation:

Currently, we have a single backend service that utilizes one priority queue for
in order to isolate actions. Different actions outlined above have different priorities,
and each action is done atomically.

updates are broadcasted at a high priority, and in addition they are queued up to
update the local raster.

This local raster is updated at a moderate priority. One update at a time in case a
higher priority task comes in.

Writes are enqueued at a very low priority every so often by the broadcast_mediator. And
every so often, at a very high priority to make sure that they aren't ignored.

when a new client is added, it is given the local raster in its current state
as well as all pending updates that have been broadcasted but haven't been applied to the local raster

removing clients is easy, albeit when the last client is removed, the picture has to be written
and the whole tracked picture should be removed.

This current situation covers requirements 1-4. But currently, the pictures are stored locally. The
following section will outline how to extract the pictures to s3. In addition, I would like to
simplify things (and solve the one bug :O)

## S3

going to check on s3 eventual consistency
* whoa, it is strongly consistent!
* https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html#ConsistencyModel

So, we have a decision between simply implementing another PictureAccessor (S3PictureAccessor)
or, extracting the whole thing into a service.

### Simply implement a new PictureAccessor

I think for now I lean towards just implementing another PictureAccessor because it
is likely pretty straightforward.

### Implement a new PrimaryPictureService

But, on the other hand, it doesn't solve the bug or simplify things. And, it isn't forward
looking because broadcasting updates and maintaining a primary copy of the picture(s) are
different purposes and could scale differently.

What is hard about a new PrimaryPictureService? Well, it means some operations are blocking more
I guess. Examples:
* when BS (BroadcastService ie the existing one) receives an update, it needs to
broadcast (unaffected) and update the local copy. It currently can enqueue an operation
to do that without blocking, but with this, it would either need to enqueu the write, or 
block to send it to the service

#### send updates to PPS immediately upon receiving or batch

##### Opt1: enqueue primary picture updates on BS
pros:
* can keep nonblocking invariant true when receiving an update

cons:
* will need to decide of pending primary picture updates on BS

##### Opt2: send primary picture updates to be enqueued by PPS
pros:
* all primary picture updates are tracked by PPS

cons:
* need to block (most likely?) when sending to PPS, which breaks the paradigm of not blocking

##### Choice
Opt1: enqueue primary picture updates on BS

#### should PPS batch updates or handle immediately

An interesting consequence of this is that I have to decide whether to have PPS
update upon receiving updates, or if it should batch them

##### Opt1: PPS batches updates
pros:
* BS is only blocked for a short amount of time (network + enqueue operation)

cons:
* multiple queues of pending updates to track (BS' primaryPendingUpdates and PPS' pendingUpdates)
* PPS now has to have a queueing mechanism, or some way to ensure that we can still get picture reliably

PPS synchronization consequences:
PPS now has a queue.  I can probably use a similar priority queue with just a single update. And in fact,
I can probably utilize the different priorities for returning a picture when adding a client and writing a picture to s3 (in
addition to just handling updates). This solves for those two and fits this one.

When BS asks for a picture, the picture and any pending updates are returned.

Its not so simple though. that needs to happen synchronously.

Yeah I think this is all fine. The background thread (queue) is either updating (non blocking), or writing (blocking).
Then, when its asked for the current primary picture, it returns that and the pending updates.

One question, how does it handle a bunch of batched updates and then a picture request? I'm not 100%, but I
think that when a single batched update job (Queue.job) finishes, the cpu is released and there is a chance for the
request to be handled. Its definitely isolated (if not, easy enough to do some kind of mutex/semaphore), so that
just leaves prioritization. And I don't actually know how node decides what to run next. It seems like its FIFO.
and since the queue doesn't start something until the current thing is finished, the next thing won't be started
and there fore the incoming get picture request to return to a new client would be FIFOed before any handle update
or write operations from the queued.

Note, its interesting and worth calling out that the getPicture request could run while the PPS is blocked on
writing to s3. I think it still works, both are reading from a picture, so its not being updated by either. and
getPicture is nonblocking.

##### Opt2: PPS doesn't return until update is applied
pros:
* only a single queue of pending updates to track (BS' primaryPendingUpdates)
* PPS is simplified in that all its operations (getPicture (for adding client) and handleUpdate) are synchronous

cons:
* blocks broadcast service for longer

PPS synchronization consequences:
I already wrote ths section for Opt1, and its hard to think that the mechanism would be any different.

But it would be, when asking for a picture, we just return the picture, and its a blocking action.
when asking for a write, it just will write, and its a blocking action.
when sending an update, it just updates the picture, and its a blocking action.


##### Pre choice discussion
The biggest factor here is what PPS' synchronization mechanism will look like. I will go back to the
two options and briefly describe what PPS would be doing in each situation.

##### Choice
Opt1: PPS batches updates

#### should BS initiate the writes, or should PPS initiate

I think just philosophically we should have PPS initiate


### What happens to BS?

Once PPS is created, BS will just broadcast and enqueue in order to send to PPS.
It will also add and remove clients. This requires a bit of thought.

Adding the first client requires PPS to initialize the picture. Adding a subsequent
client requires getting the latest picture from PPS, as well as both queues (PPS' and BS').
And removing the last client requires a write and a deinitialization of the picture.

So, PPS needs three (two?) synchronous operations.

initialize:
  read picture from s3
  empty queue

getPicture:
  if not initialized
    initialize
  return { picture, updatesQueue }

deinitialize:
  wait for queue to be empty
  write picture
  return

I think I will leave the idea of cold vs hot start for later. In other words, if
the picture is in the process of deinitialization when a new first client joins,
the picture will still complete the deinitialieation and then reinitialize.





