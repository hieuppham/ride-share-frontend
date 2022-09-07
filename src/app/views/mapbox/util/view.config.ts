import { MapboxComponent } from '../mapbox.component';

import { NavigationControl } from 'mapbox-gl';

function initView(mapBoxComponent: MapboxComponent): void {
  mapBoxComponent.ctrlTopLeft = document.getElementsByClassName(
    'mapboxgl-ctrl-top-left'
  )[0] as HTMLDivElement;

  mapBoxComponent.ctrlMidRight = document.getElementsByClassName(
    'mapboxgl-ctrl-mid-right'
  )[0] as HTMLDivElement;

  document
    .getElementsByClassName('mapboxgl-control-container')[0]
    .append(mapBoxComponent.ctrlMidRight);

  mapBoxComponent.ctrlBottomLeft = document.getElementsByClassName(
    'mapboxgl-ctrl-bottom-left'
  )[0] as HTMLDivElement;

  mapBoxComponent.ctrlTopCenter = document.getElementsByClassName(
    'mapboxgl-ctrl-top-center'
  )[0] as HTMLDivElement;

  mapBoxComponent.ctrlBottomRight = document.getElementsByClassName(
    'mapboxgl-ctrl-bottom-right'
  )[0] as HTMLDivElement;

  // top center
  document
    .getElementsByClassName('mapboxgl-control-container')[0]
    .append(mapBoxComponent.ctrlTopCenter);

  // bottom right
  mapBoxComponent.map.addControl(new NavigationControl(), 'bottom-right');

  (
    mapBoxComponent.ctrlBottomRight.getElementsByClassName(
      'mapboxgl-ctrl mapboxgl-ctrl-attrib'
    )[0] as HTMLDivElement
  ).remove();
  mapBoxComponent.divButtonApplyWrapper = document.getElementById(
    'toggle-table-container'
  ) as HTMLDivElement;

  mapBoxComponent.ctrlBottomRight.style.display = 'flex';
  mapBoxComponent.ctrlBottomRight.prepend(
    mapBoxComponent.divButtonApplyWrapper
  );
  mapBoxComponent.divButtonApplyWrapper.style.background = 'none';

  mapBoxComponent.buttonApplyPoint = document.getElementById(
    'btn-toggle-table'
  ) as HTMLButtonElement;
}

export { initView };
