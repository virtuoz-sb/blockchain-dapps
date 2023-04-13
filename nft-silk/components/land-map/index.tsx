import { Component } from 'react';
import clsx from 'clsx';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { filter, find, forEach, map, times, sortBy } from 'lodash-es';
import Account from '@components/ethereum/Account/Account';

import { Icon } from '@components/icons';
import { Loader } from '@components/loader';
import { RadioInput } from '@components/inputs/radio-input';

import styles from './land-map.module.scss';

let mapCreated = false;
const miniMapWidth = 150;

// all possible coordinates
const allCoordinates = [];
const xMax = 160;
const yMax = 160;
const grayedOpacity = 0.3;

times(xMax, x => {
  times(yMax, y => {
    allCoordinates.push({ x, y });
  });
});

type LandMapProps = {
  className?: string;
  mapData: any[];
  ownedLandTokenIds?: Number[];
  ownedFarmTokenIds?: Number[];
  onClick: Function;
  onCountUpdated: Function;
  filters: any;
  filtersUpdated: boolean;
  developLands: any[];
  onUpdateDevelopLands: Function;
  isDetailOpen: boolean;
  isWalletConnected: boolean;
  allowLandSelection: boolean;
  trans: Function;
  showStats?: boolean;
  showLogs?: boolean;
};

enum LandType {
  land = 'land',
  unmintedLand = 'unmintedLand',
  ownedLand = 'ownedLand',
  privateFarm = 'privateFarm',
  publicFarm = 'publicFarm',
  selectedLand = 'selectedLand',
}

enum LegendAssetType {
  all = 1,
  my = 2,
}

enum MapMode {
  display = 1,
  develop = 2,
}

export default class LandMap extends Component<LandMapProps> {
  state = {
    legendAssetType: LegendAssetType.all,
    loading: true,
    mapMode: MapMode.display,
    miniMapLoading: false,
    showLegend: false,
    showMiniMap: false,
  };
  stats = null;
  scene = null;
  miniMapScene = null;
  renderer = null;
  miniMapRenderer = null;
  camera = null;
  miniMapCamera = null;
  grid = null;
  controls = null;
  miniMapBox = null;
  miniMapBoxControls = null;
  boundingBox = null;
  pointer = null;
  raycaster = null;
  coordinates = null;
  mapCenter = null;
  selectedPieces = [];
  eventListeners = {
    animate: null,
    controls: null,
    map: {},
    miniMap: {},
    resize: null,
  };
  mapGeometries = [];
  materials = [];
  baseMaterials = {
    [LandType.land]: {
      color: 0x2ac161,
    },
    [LandType.unmintedLand]: {
      color: 0x2e3645,
    },
    [LandType.ownedLand]: {
      color: 0x4583ff,
    },
    [LandType.privateFarm]: {
      color: 0xffe45c,
    },
    [LandType.publicFarm]: {
      color: 0xe3e9f4,
    },
    [LandType.selectedLand]: {
      color: 0x4583ff,
    },
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.createMap();
  }

  componentDidUpdate(prevProps) {
    if (this.props.mapData !== null && this.props.ownedLandTokenIds !== null) {
      this.createMap();
    }

    // if detail is closed and a tile is selected, de-select it
    if (
      prevProps.isDetailOpen !== this.props.isDetailOpen &&
      !this.props.isDetailOpen &&
      this.props.developLands === null &&
      this.selectedPieces.length > 0
    ) {
      this.selectedPieces = [];
      this.resetMaterials();
      this.renderer.render(this.scene, this.miniMapCamera);
    }

    // reset legend to all if wallet is disconnected
    if (prevProps.isWalletConnected !== this.props.isWalletConnected && !this.props.isWalletConnected) {
      this.onMiniMapLoading();
      this.onChangeLegendAssetType(LegendAssetType.all);
    }

    if (prevProps.developLands !== this.props.developLands) {
      if (this.props.developLands) {
        this.onDevelopLand();

        if (this.state.mapMode !== MapMode.develop) {
          this.onMiniMapLoading();
          this.onUpdateTiles();

          this.setState({
            legendAssetType: this.state.legendAssetType,
            loading: this.state.loading,
            mapMode: MapMode.develop,
            miniMapLoading: this.state.miniMapLoading,
            showLegend: this.state.showLegend,
            showMiniMap: this.state.showMiniMap,
          });
        }
      } else {
        // reduce selected pieces down to first selected piece
        if (this.selectedPieces.length > 1) {
          this.selectedPieces = [this.selectedPieces[0]];
        }

        if (this.state.legendAssetType === LegendAssetType.my) {
          this.resetMaterials();
          this.onChangeLegendAssetType(this.state.legendAssetType);
        } else {
          this.onMiniMapLoading();

          forEach(this.mapGeometries, g => {
            g.material.opacity = 1;
          });

          this.resetMaterials();
          this.onFiltersUpdated();
        }

        this.setState({
          legendAssetType: this.state.legendAssetType,
          loading: this.state.loading,
          mapMode: MapMode.display,
          miniMapLoading: this.state.miniMapLoading,
          showLegend: this.state.showLegend,
          showMiniMap: this.state.showMiniMap,
        });
      }
    }

    // change land props if owned land/farm tokens ids are updated
    if (
      (prevProps.ownedLandTokenIds !== this.props.ownedLandTokenIds ||
        prevProps.ownedFarmTokenIds !== this.props.ownedFarmTokenIds) &&
      mapCreated
    ) {
      this.onMiniMapLoading();
      const highlightAssets = this.state.legendAssetType === LegendAssetType.my;

      forEach(this.mapGeometries, g => {
        const isOwned =
          g?.userData?.land.tokenId &&
          find(
            g?.userData?.land.plotType === 'Farm' ? this.props?.ownedFarmTokenIds : this.props?.ownedLandTokenIds,
            t => t === g?.userData?.land.tokenId
          ) !== undefined;

        g.userData.isOwned = isOwned;
        g.material.opacity = highlightAssets ? (!isOwned ? 0.3 : 1) : 1;
      });

      this.onUpdateTiles();
    }

    // run filters
    if (
      prevProps.filtersUpdated !== this.props.filtersUpdated &&
      this.props.filtersUpdated &&
      this.state.mapMode === MapMode.display
    ) {
      this.onFiltersUpdated();
    }
  }

  componentWillUnmount() {
    this.log('unmounting');
    this.eventListeners?.resize?.disconnect();

    if (this.renderer?.domElement) {
      forEach(this.eventListeners.map, (el, prop) => {
        this.renderer.domElement.removeEventListener(prop, el);
      });

      document.getElementById('land-map')?.removeChild(this.renderer.domElement);

      if (this.props?.showStats) {
        document.getElementById('land-map')?.removeChild(this.stats.domElement);
      }
    }

    if (this.miniMapRenderer?.domElement) {
      forEach(this.eventListeners.miniMap, (el, prop) => {
        this.miniMapRenderer.domElement.removeEventListener(prop, el);
      });

      document.getElementById('mini-map')?.removeChild(this.miniMapRenderer.domElement);
    }

    if (this.controls) {
      this.controls.removeEventListener('change', this.eventListeners.controls);
      this.controls = null;
    }

    this.miniMapRenderer = null;
    this.renderer = null;
    this.scene = null;
    this.miniMapScene = null;
    this.raycaster = null;
    this.pointer = null;
    this.camera = null;
    this.miniMapCamera = null;

    const style = document.getElementById('mini-map').style;
    style.backgroundImage = 'none';

    cancelAnimationFrame(this.eventListeners.animate);
    mapCreated = false;
  }

  deleteObject(object: THREE.Object) {
    object.geometry.dispose();

    if (object.material instanceof Array) {
      forEach(object.material, material => material.dispose());
    } else {
      object.material.dispose();
    }

    object.removeFromParent();

    if (this.scene) {
      this.scene.remove(object);
    }
  }

  createMap() {
    if (!mapCreated && this.props?.mapData !== null && this.props.ownedLandTokenIds !== null) {
      mapCreated = true;

      // clear out geometries
      forEach(this.mapGeometries, g => {
        this.deleteObject(g);
      });

      this.mapGeometries = [];
      this.pointer = new THREE.Vector2();
      this.eventListeners.resize = new ResizeObserver(() => {
        this.onUpdateCanvasSize();
      });

      this.eventListeners.resize.observe(document.getElementById('land-map'));

      this.log('creating map...');
      this.onMapCreate();
      this.onUpdateCanvasSize();
    }
  }

  onMapCreate() {
    this.log('onMapCreate');

    // common
    this.scene = new THREE.Scene();
    this.miniMapScene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.scene.background = 0xffffff;

    const el = document.getElementById('land-map');

    // land map
    let width = el.offsetWidth;
    let height = el.offsetHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setSize(width, height);
    //this.renderer.setPixelRatio(window.devicePixelRatio * 0.75);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    if (el) {
      el.appendChild(this.renderer.domElement);

      // STATS
      if (this.props?.showStats) {
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = null;
        this.stats.domElement.style.right = '0';
        this.stats.domElement.style.zIndex = 100;
        el.appendChild(this.stats.domElement);
      }
    }

    // mini map
    this.miniMapCamera = new THREE.OrthographicCamera(
      miniMapWidth / -2,
      miniMapWidth / 2,
      miniMapWidth / 2,
      miniMapWidth / -2,
      1,
      1000
    );
    // this.miniMapCamera.up.set(0, 0, -1);
    // this.miniMapCamera.lookAt(new THREE.Vector3(0, 0, 0));

    this.miniMapCamera.zoom = 0.87;

    this.miniMapRenderer = new CSS2DRenderer();
    this.miniMapRenderer.domElement.style.display = 'none';

    document.getElementById('mini-map')?.appendChild(this.miniMapRenderer.domElement);

    this.materials = [];

    // create materials from base materials array
    forEach(this.baseMaterials, item => {
      let current = new THREE.MeshBasicMaterial({
        color: item.color,
        wireframe: false,
      });

      this.materials.push(current);
    });

    this.createGridLines();
    this.createMapTiles();

    this.boundingBox = new THREE.Box3().setFromObject(this.scene);

    this.createMapControls();
    this.setCameraToMapCenter();
    this.setRendererEventHandlers();

    this.renderer.render(this.scene, this.miniMapCamera);

    this.setState({
      legendAssetType: this.state.legendAssetType,
      loading: false,
      mapMode: this.state.mapMode,
      miniMapLoading: true,
      showLegend: true,
      showMiniMap: true,
    });

    document
      .getElementById('land-map')
      ?.querySelector('canvas')
      ?.toBlob(blob => {
        if (document.getElementById('mini-map')) {
          const url = URL.createObjectURL(blob);
          const style = document.getElementById('mini-map').style;
          style.backgroundImage = `url("${url}")`;
          style.backgroundSize = `${miniMapWidth}px ${miniMapWidth}px`;
          this.miniMapRenderer.setSize(miniMapWidth, miniMapWidth);

          // give time for bg to load and then show white box for mini map
          setTimeout(() => {
            this.miniMapRenderer.domElement.style.display = 'block';
            this.setState({
              legendAssetType: this.state.legendAssetType,
              loading: false,
              mapMode: this.state.mapMode,
              miniMapLoading: false,
              showLegend: true,
              showMiniMap: true,
            });
            this.log('loaded');
          });
        }
      });

    this.createMapViewBox();
    this.setCameraToMapCenter();
    this.animate();
  }

  // UTILITIES
  tileToPosition(tileX, tileY, tileSize) {
    return new THREE.Vector2(tileX, tileY);
  }

  mapGeometry(width, position) {
    let geometry = new THREE.PlaneBufferGeometry(width, width);
    geometry.translate(position.x, position.y, 1);

    return geometry;
  }

  resetMaterials() {
    const tiles = this.scene.children[1];

    forEach(tiles.children, tile => {
      if (tile.userData.type != LandType.unmintedLand && this.selectedPieces.indexOf(tile.userData.id) > -1) {
        tile.material.color.setHex(this.baseMaterials[LandType.selectedLand].color);
        tile.material.opacity = 1.0;
        this.log(tile);
      } else {
        tile.material.color.setHex(this.baseMaterials[tile.userData.type].color);
      }
    });
  }

  setCameraToMapCenter() {
    this.log('setCameraToMapCenter');

    // set cameras and controls to center of map on load
    if (this.mapCenter) {
      this.mapCenter.geometry.computeBoundingSphere(); // must call this to compute sphere

      if (this.mapCenter.geometry.boundingSphere) {
        const pos = this.mapCenter.geometry.boundingSphere.center;
        this.camera.position.set(pos.x, pos.y, 90);
        // this.camera.lookAt(pos.x, pos.y, 1);
        this.controls.target = pos;

        this.miniMapCamera.position.copy(this.camera.position);
        this.grid.position.set(pos.x - 0.5, pos.y - 0.5, 1);

        if (this.miniMapBox) {
          this.miniMapBox.position.set(pos.x, pos.y, 1);
        }
      }
    } else {
      this.camera.position.set(0, 0, 90);
      this.miniMapCamera.position.set(0, 0, 90);
      this.grid.position.set(0, 0, 1);
    }

    // update cameras
    this.camera.updateProjectionMatrix();
    this.miniMapCamera.updateProjectionMatrix();

    // update controls
    this.controls.update();
  }

  setRendererEventHandlers() {
    this.log('setRendererEventHandlers');

    // handle dragging/clicking on map
    let mapDrag;

    this.eventListeners.map = {
      pointerdown: e => {
        mapDrag = false;
      },
      pointermove: e => {
        mapDrag = true;
      },
      pointerup: e => {
        if (!mapDrag) {
          this.onMapClick.call(this, e);
        }
      },
    };

    forEach(this.eventListeners.map, (el, prop) => {
      this.renderer.domElement.addEventListener(prop, el);
    });

    // handle dragging/clicking on mini map
    let miniMapDrag;

    this.eventListeners.miniMap = {
      pointerdown: e => {
        miniMapDrag = true;
        this.onMiniMapClick.call(this, e);
      },
      pointermove: e => {
        if (miniMapDrag) {
          this.onMiniMapClick.call(this, e);
        }
      },
      pointerup: e => {
        miniMapDrag = false;
      },
    };

    forEach(this.eventListeners.miniMap, (el, prop) => {
      this.miniMapRenderer.domElement.addEventListener(prop, el);
    });
  }

  updateCoordinates(value) {
    this.coordinates = value;
  }

  canDevelopLand(posX, posY) {
    const land = find(this.mapGeometries, mg => mg.userData.position.x === posX && mg.userData.position.y === posY);

    if (
      land &&
      land.userData.isOwned &&
      land.userData?.land.plotType !== 'Farm' &&
      find(this.props.developLands, dl => dl.id === land.userData.id) === undefined
    ) {
      return land;
    }

    return null;
  }

  // look at all other selected pieces and check if it's still contingious without land with id passed in
  canDeselectDevelopLand(id) {
    if (this.selectedPieces.length > 1) {
      const remainingSelectedPieces = sortBy(filter(this.selectedPieces, sp => sp !== id));
      const land = find(this.mapGeometries, mg => mg.userData.id === remainingSelectedPieces[0]);

      if (land) {
        let touchedLandIds = [];
        let touchedLands = [];
        let currentLand = land;
        let isChecking = true;
        let addLand = true;

        while (isChecking) {
          if (currentLand) {
            const posX = currentLand.userData?.position.x;
            const posY = currentLand.userData?.position.y;

            if (addLand) {
              touchedLands.push(currentLand);
              touchedLandIds.push(currentLand.userData?.id);
            }

            const up = find(
              this.mapGeometries,
              mg => mg.userData.position.x === posX && mg.userData.position.y === posY + 1
            );
            const upId = up?.userData.id || null;

            if (
              upId &&
              upId !== id &&
              remainingSelectedPieces.indexOf(upId) > -1 &&
              touchedLandIds.indexOf(upId) === -1
            ) {
              addLand = true;
              currentLand = up;
              continue;
            }

            const down = find(
              this.mapGeometries,
              mg => mg.userData.position.x === posX && mg.userData.position.y === posY - 1
            );
            const downId = down?.userData.id || null;

            if (
              downId &&
              downId !== id &&
              remainingSelectedPieces.indexOf(downId) > -1 &&
              touchedLandIds.indexOf(downId) === -1
            ) {
              addLand = true;
              currentLand = down;
              continue;
            }

            const left = find(
              this.mapGeometries,
              mg => mg.userData.position.x === posX - 1 && mg.userData.position.y === posY
            );
            const leftId = left?.userData.id || null;

            if (
              leftId &&
              leftId !== id &&
              remainingSelectedPieces.indexOf(leftId) > -1 &&
              touchedLandIds.indexOf(leftId) === -1
            ) {
              addLand = true;
              currentLand = left;
              continue;
            }

            const right = find(
              this.mapGeometries,
              mg => mg.userData.position.x === posX + 1 && mg.userData.position.y === posY
            );
            const rightId = right?.userData.id || null;

            if (
              rightId &&
              rightId !== id &&
              remainingSelectedPieces.indexOf(rightId) > -1 &&
              touchedLandIds.indexOf(rightId) === -1
            ) {
              addLand = true;
              currentLand = right;
              continue;
            }

            addLand = false;
            currentLand = touchedLands.length > 0 ? touchedLands.pop() : null;
          } else {
            isChecking = false;
          }
        }

        return touchedLandIds.length === remainingSelectedPieces.length;
      }

      return false;
    }

    return false;
  }

  // CREATE METHODS
  createLandTile(width, position, type: LandType, id, land, isOwned, highlightAssets) {
    const isFarm = type === LandType.privateFarm || type === LandType.publicFarm;
    const pos = this.tileToPosition(position.x, position.y, 1);
    const geo = this.mapGeometry(width, pos);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: this.baseMaterials[type].color,
        opacity: highlightAssets ? (isOwned ? 1.0 : grayedOpacity) : 1.0,
        transparent: true,
        depthTest: false,
      })
    );

    mesh.userData = {
      id,
      position,
      type,
      isOwned,
      land,
    };

    mesh.renderOrder = isFarm ? 3 : 1;

    this.mapGeometries.push(mesh);
  }

  // should be called after createMapTiles, to show on top of tiles
  createGridLines() {
    this.log('createGridLines');

    this.grid = new THREE.GridHelper(xMax, yMax, 0x000000, 0x000000);
    this.grid.rotation.x = Math.PI / 2;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.75;
    this.grid.renderOrder = 2;

    this.scene.add(this.grid);
  }

  createMapTiles() {
    this.log('createMapTiles');

    const data = this.props?.mapData;

    // get coordinates from supplied data
    const usedCoordinates = map(data, d => ({
      x: d.xCoordinate,
      y: d.yCoordinate,
    }));

    // calculate unused coordinates from used
    // not the fastest way I assume, but indexOf doesn't work b/c object reference comparison
    const unusedCoordinates = filter(
      allCoordinates,
      c => find(usedCoordinates, uc => uc.x === c.x && uc.y === c.y) === undefined
    );

    // plot all data points on map
    forEach(data, plot => {
      const isFarm = plot.plotType.toLowerCase() === 'farm';
      const plotType = isFarm
        ? plot.isPublic
          ? `public${plot.plotType}`
          : `private${plot.plotType}`
        : plot.plotType.toLowerCase();

      this.createLandTile(
        1,
        { x: plot.xCoordinate, y: plot.yCoordinate },
        plotType,
        `${plot.plotType}-${plot.tokenId}`,
        plot,
        plot.tokenId &&
          find(
            plot.plotType === 'Farm' ? this.props?.ownedFarmTokenIds : this.props?.ownedLandTokenIds,
            t => t === plot.tokenId
          ) !== undefined,
        this.state.legendAssetType === LegendAssetType.my
      );
    });

    // plot unused land on map
    forEach(unusedCoordinates, plot => {
      this.createLandTile(
        1,
        { x: plot.x, y: plot.y },
        LandType.unmintedLand,
        `${LandType.unmintedLand}-${plot.x}-${plot.y}`,
        plot,
        false,
        this.state.legendAssetType === LegendAssetType.my
      );
    });

    let group = new THREE.Group();

    // add tiles to group, find center
    forEach(this.mapGeometries, (mapGeo, mapGeoIndex) => {
      group.add(mapGeo);

      if (mapGeo.userData.position.x === Math.floor(xMax / 2) && mapGeo.userData.position.y === Math.floor(yMax / 2)) {
        this.mapCenter = mapGeo;
      }
    });

    this.scene.add(group);
  }

  createMapControls() {
    this.log('createMapControls');
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.enablePan = true;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 50;

    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
    };

    this.controls.touches = {
      ONE: THREE.TOUCH.PAN,
      TWO: THREE.TOUCH.DOLLY,
    };

    this.controls.keys = {
      LEFT: 'ArrowLeft', //left arrow
      UP: 'ArrowUp', // up arrow
      RIGHT: 'ArrowRight', // right arrow
      BOTTOM: 'ArrowDown', // down arrow
    };

    this.eventListeners.controls = () => this.onMapControlsUpdate.call(this);
    this.controls.addEventListener('change', this.eventListeners.controls);
  }

  createMapViewBox() {
    this.log('createMapViewBox');

    // if already exists, remove
    if (this.miniMapBox) {
      this.miniMapScene.remove(this.miniMapBox);
    }

    this.miniMapBox = new CSS2DObject(document.createElement('div'));

    this.setMapViewBoxDimensions();

    this.miniMapScene.add(this.miniMapBox);
  }

  setMapViewBoxDimensions() {
    const width = document.getElementById('land-map')?.offsetWidth;
    const height = document.getElementById('land-map')?.offsetHeight;

    const widthRatio = miniMapWidth / width;
    const heightRatio = miniMapWidth / height;

    this.miniMapBox.element.className = styles.box;
    this.miniMapBox.element.style.height = `${height * 0.135 * heightRatio}px`;
    this.miniMapBox.element.style.width = `${width * 0.135 * widthRatio * this.camera.aspect}px`;
  }

  // EVENT HANDLERS
  onMapClick(event) {
    this.log('onMapClick');
    const rect = this.renderer.domElement.getBoundingClientRect();
    const clientX = event.type == 'touchup' ? event.touches[0].clientX : event.clientX;
    const clientY = event.type == 'touchup' ? event.touches[0].clientY : event.clientY;

    this.pointer.x = ((clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / this.renderer.domElement.clientHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects && intersects.length > 2 && intersects?.[2] !== null) {
      if (intersects[2].object.userData.type !== LandType.unmintedLand) {
        const object = intersects[2].object;
        const data = object.userData;
        const id = data.id;

        if (this.props.allowLandSelection) {
          // if in develop mode and land is owned, opacity is 1.0, and is not the initial developed land, then allow select/deselect
          if (this.state.mapMode === MapMode.develop) {
            if (data?.isOwned && object?.material.opacity === 1.0 && data?.id !== this.selectedPieces[0]) {
              const foundItem = find(this.props.developLands, l => l.id === id);

              // check if we already have this land selected, deselect it
              if (foundItem) {
                // check if land can be de-selected, by looking at lands around it
                if (this.canDeselectDevelopLand(foundItem.id)) {
                  this.props?.onUpdateDevelopLands(filter(this.props.developLands, l => l !== foundItem));
                  this.selectedPieces = filter(this.selectedPieces, p => p !== id);
                }
              } else {
                this.selectedPieces.push(id);
                this.props?.onUpdateDevelopLands([...this.props.developLands, intersects[2].object.userData]);
              }
            }
          } else {
            this.selectedPieces = [intersects[2].object.userData.id];
            this.props?.onClick(intersects[2]);
          }
        }
      }
    }

    this.resetMaterials();

    // if (this.raycaster.intersectObjects(this.scene.children)[2]) {
    //   this.coordinates = this.raycaster.intersectObjects(this.scene.children)[2].point;
    //   if (this.selectedPiece && this.selectedPiece !== this.lastSelectedPiece) {
    //     this.updateCoordinates(this.coordinates);
    //   }
    // }

    this.renderer.render(this.scene, this.camera);
  }

  onMiniMapClick(event) {
    this.log('onMiniMapClick');
    const el = this.miniMapRenderer.domElement;
    const rect = el.getBoundingClientRect();
    const clientX = event.type == 'touchup' ? event.touches[0].clientX : event.clientX;
    const clientY = event.type == 'touchup' ? event.touches[0].clientY : event.clientY;

    const x = ((clientX - rect.left) / el.clientWidth) * 2 - 1;
    const y = -((clientY - rect.top) / el.clientHeight) * 2 + 1;

    this.mapCenter.geometry.computeBoundingSphere(); // must call this to compute sphere
    const pos = this.mapCenter.geometry.boundingSphere.center;

    // converts click x,y to camera x,y
    let posX = x * pos.x + pos.x;
    let posY = y * pos.y + pos.y;

    this.camera.position.set(posX, posY, this.camera.position.z);

    this.camera.lookAt(posX, posY, this.controls.target.z);
    this.camera.updateProjectionMatrix();
    this.controls.target.x = posX;
    this.controls.target.y = posY;
    this.controls.update();
  }

  onMiniMapLoading() {
    this.setState({
      legendAssetType: this.state.legendAssetType,
      loading: false,
      mapMode: this.state.mapMode,
      miniMapLoading: true,
      showLegend: this.state.showLegend,
      showMiniMap: this.state.showMiniMap,
    });
  }

  onMapControlsUpdate() {
    this.log('onMapControlsUpdate');

    // update minimap box position
    if (this.miniMapBox) {
      this.miniMapBox.position.set(this.camera.position.x, this.camera.position.y, 1);
    }

    // prevent over panning
    let posX = Math.min(xMax, Math.max(0, this.camera.position.x));
    let posY = Math.min(yMax, Math.max(0, this.camera.position.y));

    if (posX !== this.camera.position.x || posY !== this.camera.position.y) {
      this.camera.position.set(posX, posY, this.camera.position.z);

      this.camera.lookAt(posX, posY, this.controls.target.z);
      this.camera.updateProjectionMatrix();
      this.controls.target.x = posX;
      this.controls.target.y = posY;
      this.controls.update();
    }
  }

  onFiltersUpdated() {
    this.onMiniMapLoading();

    if (this.props.filters.acreType !== null) {
      this.onLandFilter();
    }

    if (
      this.props.filters.farms.type !== null &&
      (this.props.filters.farms.size !== null ||
        this.props.filters.farms.forSale !== null ||
        this.props.filters.farms.vacant !== null)
    ) {
      this.onFarmFilter();
    }

    if (this.props.filters.coordinates.min !== null || this.props.filters.coordinates.max !== null) {
      console.log('coordinates updated');
      this.onCoordinateFilter();
    }

    // empty filters
    if (
      this.props.filters.acreType === null &&
      this.props.filters.farms.type === null &&
      this.props.filters.coordinates.min === null &&
      this.props.filters.coordinates.max === null
    ) {
      forEach(this.mapGeometries, g => {
        g.material.opacity = 1.0;
      });

      this.props.onCountUpdated(this.props.mapData.length);
    }

    this.onUpdateTiles();
  }

  onLandFilter() {
    const showOnlyForSale = this.props.filters.acreType === 'forSale';
    let count = 0;

    forEach(this.mapGeometries, g => {
      if (g.userData.type === LandType.land || g.userData.type === LandType.ownedLand) {
        g.material.opacity = showOnlyForSale ? (g.userData?.land.isForSale ? 1.0 : grayedOpacity) : 1.0;

        if (g.material.opacity === 1.0) {
          count++;
        }
      } else {
        g.material.opacity = grayedOpacity;
      }
    });

    this.props.onCountUpdated(count);
  }

  onFarmFilter() {
    const showOnlyForSale = this.props.filters.farms.forSale;
    const size = this.props.filters.farms.size;
    const type: LandType = `${this.props.filters.farms.type}Farm` as LandType;
    let count = 0;

    forEach(this.mapGeometries, g => {
      if (g.userData.type === type) {
        let highlight = true;

        if (showOnlyForSale && !g.userData?.land.isForSale) {
          highlight = false;
        }

        if (highlight && size && size !== 'all') {
          const farmSize = filter(
            this.props.mapData,
            d => d.plotType === 'Farm' && d.tokenId === g.userData?.land.tokenId
          );
          highlight = farmSize.length === size;
        }

        g.material.opacity = highlight ? 1 : grayedOpacity;

        if (highlight) {
          count++;
        }
      } else {
        g.material.opacity = grayedOpacity;
      }
    });

    this.props.onCountUpdated(count);
  }

  onCoordinateFilter() {
    const min = this.props.filters.coordinates.min.split(',');
    const max = this.props.filters.coordinates.max.split(',');
    const minPos = { x: Number(min[0]), y: Number(min[1]) };
    const maxPos = { x: Number(max[0]), y: Number(max[1]) };
    const centerPos = {
      x: minPos.x + Math.floor((maxPos.x - minPos.x) / 2),
      y: minPos.y + Math.floor((maxPos.y - minPos.y) / 2),
    };
    let mapCenter = null;
    let count = 0;

    forEach(this.mapGeometries, g => {
      const pos = g.userData.position;

      if (pos.x >= minPos.x && pos.x <= maxPos.x && pos.y >= minPos.y && pos.y <= maxPos.y) {
        g.material.opacity = 1.0;

        if (g.userData.type !== LandType.unmintedLand) {
          count++;
        }

        if (pos.x === centerPos.x && pos.y === centerPos.y) {
          g.geometry.computeBoundingSphere(); // must call this to compute sphere
          mapCenter = g.geometry.boundingSphere.center;
        }
      } else {
        g.material.opacity = grayedOpacity;
      }
    });

    if (mapCenter) {
      this.camera.position.set(mapCenter.x, mapCenter.y, 90);
      this.controls.target = mapCenter;

      if (this.miniMapBox) {
        this.miniMapBox.position.set(mapCenter.x, mapCenter.y, 1);
      }

      // update cameras
      this.camera.updateProjectionMatrix();
      //this.miniMapCamera.updateProjectionMatrix();

      // update controls
      this.controls.update();
    }

    this.props.onCountUpdated(count, false);
  }

  onDevelopLand() {
    let geosToAdd = [];

    if (this.props?.developLands) {
      // turn all tiles gray
      forEach(this.mapGeometries, g => {
        g.material.opacity = grayedOpacity;
      });

      // loop over developed lands and change opacity
      // also checks for available lands to be developed that are contiguious to current land
      forEach(this.props?.developLands, land => {
        forEach(this.mapGeometries, (g, index) => {
          if (land.id === g.userData.id) {
            g.material.opacity = 1.0;

            // check all adjacent tiles to see if they can be developed
            const posX = g.userData.position.x;
            const posY = g.userData.position.y;
            const up = this.canDevelopLand(posX, posY + 1);
            const down = this.canDevelopLand(posX, posY - 1);
            const left = this.canDevelopLand(posX - 1, posY);
            const right = this.canDevelopLand(posX + 1, posY);

            if (up) {
              up.material.opacity = 1.0;
            }

            if (down) {
              down.material.opacity = 1.0;
            }

            if (left) {
              left.material.opacity = 1.0;
            }

            if (right) {
              right.material.opacity = 1.0;
            }

            // g.visible = false;
            // const outlineMaterial1 = new THREE.MeshBasicMaterial({
            //   color: 0xff0000,
            //   side: THREE.FrontSide,
            //   wireframe: true,
            // });
            // const outlineMesh1 = new THREE.Mesh(g.geometry, outlineMaterial1);

            // console.log(g.position);
            // console.log(outlineMesh1.position);

            // outlineMesh1.position.copy(g.position);
            // outlineMesh1.renderOrder = 3;
            // outlineMesh1.scale.multiplyScalar(1.01);
            // this.scene.add(outlineMesh1);

            var edgesGeometry = new THREE.EdgesGeometry(g.geometry);

            // var lineGeometry = new THREE.LineSegmentsGeometry().fromEdgesGeometry(edgesGeometry);
            var lineGeometry = new LineSegmentsGeometry().fromEdgesGeometry(edgesGeometry);

            const matLine = new THREE.LineBasicMaterial({
              color: 0x4080ff,
              linewidth: 5,
            });

            // console.log(Wireframe);
            // console.log(lineGeometry);
            // console.log(matLine);
            const wireframe = new Wireframe(lineGeometry, matLine);
            wireframe.computeLineDistances();
            wireframe.scale.set(10, 10, 1);
            wireframe.renderOrder = 3;
            this.scene.add(wireframe);

            // const edges = new THREE.EdgesGeometry(g.geometry);
            // const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
            // line.renderOrder = 3;
            // console.log(line);
            // this.scene.add(line);

            return false;
          }

          return true;
        });
      });
    }
  }

  onUpdateCanvasSize() {
    this.log('onUpdateCanvasSize');

    let width = document.getElementById('land-map')?.offsetWidth || 0;
    let height = document.getElementById('land-map')?.offsetHeight || 0;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // update minimap box location
    if (this.miniMapBox) {
      this.miniMapBox.gemoetry = new THREE.BoxGeometry(this.camera.getFilmWidth(), this.camera.getFilmHeight(), 0);
      this.miniMapBox.updateMatrix();
      this.setMapViewBoxDimensions();
    }
  }

  onUpdateTiles() {
    this.renderer.render(this.scene, this.miniMapCamera);

    document
      .getElementById('land-map')
      ?.querySelector('canvas')
      ?.toBlob(blob => {
        if (document.getElementById('mini-map')) {
          const url = URL.createObjectURL(blob);
          const style = document.getElementById('mini-map').style;
          style.backgroundImage = `url("${url}")`;

          setTimeout(() => {
            this.setState({
              legendAssetType: this.state.legendAssetType,
              loading: false,
              mapMode: this.state.mapMode,
              miniMapLoading: false,
              showLegend: this.state.showLegend,
              showMiniMap: this.state.showMiniMap,
            });
          });
        }
      });
  }

  onToggleMiniMap() {
    this.setState({
      legendAssetType: this.state.legendAssetType,
      loading: this.state.loading,
      mapMode: this.state.mapMode,
      miniMapLoading: this.state.miniMapLoading,
      showLegend: this.state.showLegend,
      showMiniMap: !this.state.showMiniMap,
    });
  }

  onToggleLegend() {
    this.setState({
      legendAssetType: this.state.legendAssetType,
      loading: this.state.loading,
      mapMode: this.state.mapMode,
      miniMapLoading: this.state.miniMapLoading,
      showLegend: !this.state.showLegend,
      showMiniMap: this.state.showMiniMap,
    });
  }

  async onChangeLegendAssetType(type: LegendAssetType) {
    await this.setState({
      legendAssetType: type,
      loading: this.state.loading,
      mapMode: this.state.mapMode,
      miniMapLoading: true,
      showLegend: this.state.showLegend,
      showMiniMap: this.state.showMiniMap,
    });

    const highlightAssets = type === LegendAssetType.my;
    let count = 0;

    forEach(this.mapGeometries, g => {
      if (highlightAssets) {
        g.material.opacity = g?.userData?.isOwned ? 1.0 : grayedOpacity;

        if (g?.userData?.isOwned) {
          count++;
        }
      } else {
        g.material.opacity = 1.0;

        if (g?.userData?.type !== LandType.unmintedLand) {
          count++;
        }
      }
    });

    this.props.onCountUpdated(count, type !== LegendAssetType.my);
    this.onUpdateTiles();
  }

  // MAIN FUNCTIONS
  animate() {
    this.log('animate');

    this.eventListeners.animate = requestAnimationFrame(() => {
      if (mapCreated) {
        this.animate.call(this);
      }
    });

    this.renderMap.call(this);

    if (this.props?.showStats) {
      this.stats.update();
    }

    if (this.state.loading) {
      this.setState({
        legendAssetType: this.state.legendAssetType,
        loading: false,
        mapMode: this.state.mapMode,
        miniMapLoading: this.state.miniMapLoading,
        showLegend: this.state.showLegend,
        showMiniMap: this.state.showMiniMap,
      });
    }
  }

  renderMap() {
    this.log('renderMap');
    this.miniMapRenderer.render(this.miniMapScene, this.miniMapCamera);

    const width = document.getElementById('land-map')?.offsetWidth || 0;
    const height = document.getElementById('land-map')?.offsetHeight || 0;
    const left = 0;
    const bottom = 0;

    this.renderer.setViewport(left, bottom, width, height);
    this.renderer.setScissor(new THREE.Vector4(left, bottom, 1, width));
    this.renderer.setScissorTest = true;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
  }

  log(...messages) {
    if (this.props?.showLogs) {
      console.log(messages.length === 1 ? messages[0] : messages);
    }
  }

  render() {
    return (
      <div className={clsx('flex flex-col relative z-30', this.props.className)}>
        <div id="land-map" className={styles.landMap}>
          {this.state.loading && <Loader></Loader>}
        </div>
        <div
          className={clsx(styles.miniMap, {
            [styles.closed]: !this.state.showMiniMap,
          })}
        >
          <div className={styles.title} onClick={() => this.onToggleMiniMap.call(this)}>
            <Icon name="compass" className="h-4 w-4" />
            <div className="pl-2">{this.props.trans('landMap.map.navigation.title')}</div>
            <div className={clsx(styles.chevron, { [styles.closed]: !this.state.showMiniMap })}>
              <Icon name="chevron-up" className="h-3 w-3" color="var(--color-royal-white)" />
            </div>
          </div>
          <div id="mini-map" className={styles.map}>
            {this.state.miniMapLoading && (
              <div className={styles.loader}>
                <Loader fullscreen={false}></Loader>
              </div>
            )}
          </div>
        </div>

        <div
          className={clsx(styles.legend, {
            [styles.closed]: !this.state.showLegend,
          })}
        >
          <div className={styles.title} onClick={() => this.onToggleLegend.call(this)}>
            <Icon name="legend" className="h-4 w-4" />
            <div className="pl-2">{this.props.trans('landMap.map.legend.title')}</div>
            <div className={clsx(styles.chevron, { [styles.closed]: !this.state.showLegend })}>
              <Icon name="chevron-up" className="h-3 w-3" color="var(--color-royal-white)" />
            </div>
          </div>

          <div className={styles.item}>
            <div className={clsx(styles.color, styles['land'])}></div>
            <div className={styles.itemTitle}>{this.props.trans('landMap.map.legend.items.land')}</div>
          </div>
          <div className={styles.item}>
            <div className={clsx(styles.color, styles['unmintedLand'])}></div>
            <div className={styles.itemTitle}>{this.props.trans('landMap.map.legend.items.unmintedLand')}</div>
          </div>

          {/* <div className={styles.item}>
            <div className={clsx(styles.color, styles['publicFarm'])}></div>
            <div className={styles.itemTitle}>{this.props.trans('landMap.map.legend.items.publicFarm')}</div>
          </div>

          <div className={styles.item}>
            <div className={clsx(styles.color, styles['privateFarm'])}></div>
            <div className={styles.itemTitle}>{this.props.trans('landMap.map.legend.items.privateFarm')}</div>
          </div> */}

          <hr className={styles.separator} />

          {this.props.isWalletConnected ? (
            <div className={clsx('ml-2', styles.checkboxContainer)}>
              <RadioInput
                className="mb-2"
                name="items"
                label={this.props.trans('landMap.map.legend.items.allItems')}
                id="all-items"
                value="all"
                isLarge
                checked={this.state.legendAssetType === LegendAssetType.all}
                onChange={() => this.onChangeLegendAssetType(LegendAssetType.all)}
                editable={this.state.mapMode === MapMode.display}
              />
              <RadioInput
                className="mb-2"
                name="items"
                label={this.props.trans('landMap.map.legend.items.myAssets')}
                id="my-assets"
                value="my"
                isLarge
                checked={this.state.legendAssetType === LegendAssetType.my}
                onChange={() => this.onChangeLegendAssetType(LegendAssetType.my)}
                editable={this.state.mapMode === MapMode.display}
              />
            </div>
          ) : (
            <div className={styles.button}>
              <Account notch="none" fontSize="12px" />
            </div>
          )}
        </div>
      </div>
    );
  }
}
