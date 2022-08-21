import '../App.css';

function Canvas() {



    // I think I could decode/inflate/etc a png file in a similar way to getting an image from below
    /*{
        fetch( 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' )
            .then( (r: Response) => r.arrayBuffer() )
            .then( buffer => { // note this is already an ArrayBuffer
                               // there is no buffer.data here
                    const blob = new Blob( [ buffer ] );
                    const url = URL.createObjectURL( blob );
                    const img = document.getElementById( 'img' );
                    console.log('buffer is:');
                    console.log(buffer);
                    console.log('url is:');
                    console.log(url);
                    console.log('img is:');
                    console.log(img);
                    // img.src = url; I commented this out
                    // So the Blob can be Garbage Collected
                    // img.onload = e => URL.revokeObjectURL( url );
                    // ... do something else with 'buffer'
                    } );
    }*/

    //
    //
    // why even bother with pngs at this point,
    // just request to join a picture
    // then, server gives image at a point in time
    // and starts sending updates for anything after that
    //
    // it (drawing with canvas' draw functionality as events occur) (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse)
    // kind of leaves the question of how to shove something in that
    // was stuck in transit and is late. Ie how to draw something when
    // a later event has already been drawn?
    // Maybe just redraw from that event on? pretty mellow
    //
    // so I guess I'm drawing rectangles since that is easy
    //
    // I guess I can start with a server that can:
    // 1. receive updates and apply them to a master thing
    // 2. propagate updates
    // 3. register and unregister clients from photos
    // 4. send png of picture upon registration

  return (
    <div className="Canvas">

    </div>
  );
}

export default Canvas;