import React from 'react';

import {
  HashRouter,
  Route,
  Switch,
} from 'react-router-dom';

import { Providers } from './providers';
import {
  ArtCreateView,
  ArtView,
  ArtworksView,
  HomeView,
} from './views';

export function Routes() {
  const shouldEnableNftPacks = process.env.NEXT_ENABLE_NFT_PACKS === 'true';
  return (
    <>
      <HashRouter basename={'/'}>
        <Providers>
          <Switch>
           
           
            <Route
              exact
              path="/art/create/:step_param?"
              component={() => <ArtCreateView />}
            />
            <Route
              exact
              path="/artworks/:id?"
              component={() => <ArtworksView />}
            />
            <Route exact path="/art/:id" component={() => <ArtView />} />
            
            <Route path="/" component={() => <HomeView />} />
          </Switch>
        </Providers>
      </HashRouter>
    </>
  );
}
