/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
  workbox.precaching.precacheAndRoute([
  {
    "url": "style/main.css",
    "revision": "1ec699fecc00bdfdf9bed5ad0ba1bbb6"
  },
  {
    "url": "index.html",
    "revision": "a63ccde324fdef7a2ca3af69e581c72f"
  },
  {
    "url": "js/idb-promised.js",
    "revision": "59df18a7433f090282337136440403f7"
  },
  {
    "url": "js/main.js",
    "revision": "d986eec485bf6c7d59ac06313ed6c49e"
  },
  {
    "url": "images/profile/cat.jpg",
    "revision": "69936d25849a358d314f2f82e9fa4578"
  },
  {
    "url": "images/table/arrow-down.png",
    "revision": "9350c251b1625ba91665cbfb89cef2da"
  },
  {
    "url": "images/table/arrow-up.png",
    "revision": "3172a5f9bf0d8015537cfe518d8a9760"
  },
  {
    "url": "images/table/fair.png",
    "revision": "58981f70c03288a757bccd3f4e1b3ef4"
  },
  {
    "url": "images/table/negative.png",
    "revision": "e88af694a33727120f96a49d1606ba56"
  },
  {
    "url": "images/table/neutral.png",
    "revision": "491fb846ce12af890e9f73cb818c462f"
  },
  {
    "url": "images/table/positive.png",
    "revision": "5a0f1d3af02a1029a193ba7bd98c9c39"
  },
  {
    "url": "images/table/strong-negative.png",
    "revision": "a72964a2b0ee24bd137faf7077e69657"
  },
  {
    "url": "images/table/strong-positive.png",
    "revision": "2e7d68f16fb3ba6ec4e6ede56417cf0f"
  },
  {
    "url": "images/table/strong.png",
    "revision": "95d79ea8013506fd4a725f595a896692"
  },
  {
    "url": "images/table/weak.png",
    "revision": "4fd4a76caf9dd4ae77ad3ecafd2bc450"
  },
  {
    "url": "images/touch/icon-128x128.png",
    "revision": "c2c8e1400d6126ea32eaac29009733a9"
  },
  {
    "url": "images/touch/icon-192x192.png",
    "revision": "571f134f59f14a6d298ddd66c015b293"
  },
  {
    "url": "images/touch/icon-256x256.png",
    "revision": "848055c2f5d42b0c405cff37739261e9"
  },
  {
    "url": "images/touch/icon-384X384.png",
    "revision": "a1be08eac51e8ff734a337b90ddc1c16"
  },
  {
    "url": "images/touch/icon-512x512.png",
    "revision": "b3d7c4eaefdd3d30e348a56d8048bf68"
  },
  {
    "url": "manifest.json",
    "revision": "5f4aa3bba528cf6e8f69ba0d627ec0d4"
  }
]);

  const showNotification = () => {
    self.registration.showNotification('Background sync success!', {
      body: '🎉`🎉`🎉`'
    });
  };

  const bgSyncPlugin = new workbox.backgroundSync.Plugin(
    'dashboardr-queue',
    {
      callbacks: {
        queueDidReplay: showNotification
        // other types of callbacks could go here
      }
    }
  );

  const networkWithBackgroundSync = new workbox.strategies.NetworkOnly({
    plugins: [bgSyncPlugin],
  });

  workbox.routing.registerRoute(
    /\/api\/add/,
    networkWithBackgroundSync,
    'POST'
  );

} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
