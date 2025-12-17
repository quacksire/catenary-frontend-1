import { get } from 'svelte/store';
import { createGeoJSONCircleFeature } from '../geoMathsAssist';
import { ui_theme_store, usunits_store } from '../globalstores';
import { determineDarkModeToBool } from './determineDarkModeToBool';
export function addGeoRadius(map: maplibregl.Map) {
	const dark_mode = determineDarkModeToBool();

	try {
		map.addSource('km_source', {
			type: 'geojson',
			data: {
				type: 'FeatureCollection',
				features: []
			}
		});

		map.addLayer({
			id: 'km_line',
			type: 'line',
			source: 'km_source',
			paint: {
				'line-color': dark_mode ? '#dddddd' : '#121212',
				'line-width': 1.2,
				'line-opacity': 0.8
				//'line-emissive-strength': 1
			}
		});

		map.addLayer({
			id: 'km_text',
			type: 'symbol',
			source: 'km_source',
			layout: {
				'text-field': ['get', 'label'],
				'text-font': ['Barlow-Bold'],
				'symbol-placement': 'line',
				'text-size': 8,
				'symbol-spacing': 150,
				'text-ignore-placement': true,
				'text-allow-overlap': true
			},
			paint: {
				'text-color': dark_mode ? '#ffffff' : '#121212',
				'text-halo-color': dark_mode ? '#000030' : '#eeeeee',
				'text-halo-width': 2,
				'text-opacity': 0.8
			}
		});

		map.addSource('miles_source', {
			type: 'geojson',
			data: {
				type: 'FeatureCollection',
				features: []
			}
		});

		map.addLayer({
			id: 'miles_line',
			type: 'line',
			source: 'miles_source',
			paint: {
				'line-color': dark_mode ? '#dddddd' : '#121212',
				'line-width': 1.5
				//'line-emissive-strength': 1
			}
		});

		map.addLayer({
			id: 'miles_text',
			type: 'symbol',
			source: 'miles_source',
			layout: {
				'text-field': ['get', 'label'],
				'text-font': ['Barlow-Bold'],
				'symbol-placement': 'line',
				'text-size': 8,
				'symbol-spacing': 150,
				'text-ignore-placement': true,
				'text-allow-overlap': true
			},
			paint: {
				'text-color': dark_mode ? '#ffffff' : '#121212',
				'text-halo-color': dark_mode ? '#000030' : '#eeeeee',
				'text-halo-width': 2
			}
		});
	} catch (err) {
		console.error(err);
	}
}

export function setUserCircles(map: maplibregl.Map, lng: number, lat: number) {
	const km_source = map.getSource('km_source') as maplibregl.GeoJSONSource;
	const miles_source = map.getSource('miles_source') as maplibregl.GeoJSONSource;
	const numberofpoints: number = 256;

	const distances = [0.5, 1, 2, 5, 10, 20, 50];

	const feature_list = distances.map((dist) =>
		createGeoJSONCircleFeature([lng, lat], dist, numberofpoints)
	);

	if (km_source) {
		km_source.setData({
			type: 'FeatureCollection',
			features: feature_list as any
		});
	}

	const use_us_units = get(usunits_store);

	if (use_us_units) {
		// Enabled: Hide KM layers completely
		if (map.getLayer('km_line')) {
			map.setLayoutProperty('km_line', 'visibility', 'none');
		}
		if (map.getLayer('km_text')) {
			map.setLayoutProperty('km_text', 'visibility', 'none');
		}

		const miles_distances = [0.5, 1, 2, 5, 10, 20, 50];
		const miles_feature_list = miles_distances.map((dist) => {
			// Convert miles to KM for the geometry creation, but label it as miles
			// 1 mile = 1.60934 km
			const distInKm = dist * 1.60934;
			const feature = createGeoJSONCircleFeature([lng, lat], distInKm, numberofpoints);
			// Overwrite the label to be in miles
			if (feature.properties) {
				feature.properties.label = `${dist} mi`;
			}
			return feature;
		});

		if (miles_source) {
			miles_source.setData({
				type: 'FeatureCollection',
				features: miles_feature_list as any
			});
		}
	} else {
		// Disabled: Show KM layers
		if (map.getLayer('km_line')) {
			map.setLayoutProperty('km_line', 'visibility', 'visible');
		}
		if (map.getLayer('km_text')) {
			map.setLayoutProperty('km_text', 'visibility', 'visible');
		}

		if (miles_source) {
			miles_source.setData({
				type: 'FeatureCollection',
				features: []
			});
		}
	}
}
