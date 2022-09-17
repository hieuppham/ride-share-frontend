import io from 'socket.io-client';
import { MapboxComponent } from 'src/app/views/mapbox/mapbox.component';
import {
  addRide,
  removeRide,
  changePathColor,
  isRidePrepared,
} from 'src/app/views/mapbox/util/geojson.function';
import {
  ConnectInfo,
  SocketMessage,
} from 'src/app/interface/socket.interfaces';

import {
  NEW_CONNECT,
  NEW_DISCONNECT,
  RIDE_ACTIVATED,
  RIDE_DISABLED,
  RIDE_EXPIRED,
  RIDE_INACTIVATED,
  RIDE_PREPARED,
} from 'src/app/services/socket-client/socket-event.constant';

export const socketClient: SocketIOClient.Socket = io(
  'ws://localhost:9092/ride-share',
  {
    autoConnect: false,
  }
);

export function setupSocketClient(mapboxComponent: MapboxComponent): void {
  if (socketClient.disconnected) {
    socketClient.connect();
    socketClient.on(NEW_CONNECT, (data: ConnectInfo) => {
      mapboxComponent.numberOfOnlineUser = data.numberOfConnection;
    });
    socketClient.on(NEW_DISCONNECT, (data: ConnectInfo) => {
      mapboxComponent.numberOfOnlineUser = data.numberOfConnection;
    });

    socketClient.on(RIDE_PREPARED, (data: SocketMessage) => {
      mapboxComponent.rideService.findSingleRideById(data.id).subscribe({
        next: (res) => {
          removeRide(res.id, mapboxComponent);
          addRide(res.id, mapboxComponent, res.path, res.photoURL, res.status);
          mapboxComponent.findRidesByBound();
        },
      });
    });

    socketClient.on(RIDE_ACTIVATED, (data: SocketMessage) => {
      const id: string = data.id;
      if (isRidePrepared(id, mapboxComponent.map)) {
        changePathColor(id, RIDE_ACTIVATED, mapboxComponent.map);
      } else {
        mapboxComponent.rideService.findSingleRideById(id).subscribe({
          next: (res) => {
            removeRide(res.id, mapboxComponent);
            addRide(
              res.id,
              mapboxComponent,
              res.path,
              res.photoURL,
              res.status
            );
            mapboxComponent.findRidesByBound();
          },
        });
      }
    });

    socketClient.on(RIDE_EXPIRED, (data: SocketMessage) => {
      changePathColor(data.id, RIDE_EXPIRED, mapboxComponent.map);
    });

    socketClient.on(RIDE_INACTIVATED, (data: SocketMessage) => {
      removeRide(data.id, mapboxComponent);
      mapboxComponent.findRidesByBound();
    });

    socketClient.on(RIDE_DISABLED, (data: SocketMessage) => {
      removeRide(data.id, mapboxComponent);
      mapboxComponent.findRidesByBound();
    });
  }
}
