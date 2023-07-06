import React, { useContext } from 'react';
import ProvidedServices from './provided_services';

const contexts = new Map<ProvidedServices, React.Context<any | undefined>>();

const Contextualizer = {
  createContext: <T>(service: ProvidedServices): React.Context<T | undefined> => {
    const context = React.createContext<T | undefined>(undefined);
    contexts.set(service, context);
    return context;
  },

  use: <T>(requestedService: ProvidedServices): T => {
    const context = contexts.get(requestedService);
    if (context === undefined) {
      throw new Error(`${ProvidedServices[requestedService]} was not created`);
    }
    const service = useContext(context);

    if (service === undefined) {
      throw new Error(`You must use ${ProvidedServices[requestedService]} from within its service`);
    }
    return service;
  },

  clear() {
    contexts.clear();
  },
};

export default Contextualizer;
