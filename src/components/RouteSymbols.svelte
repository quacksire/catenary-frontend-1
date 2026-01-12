<script lang="ts">
	// @ts-nocheck
	import { isSubwayRouteId, MTA_CHATEAU_ID } from '../utils/mta_subway_utils';
	import { IDFM_CHATEAU_ID, isRatpRoute } from '../utils/ratp_utils';
	import MtaBullet from './mtabullet.svelte';
	import RatpBullet from './ratpbullet.svelte';

	// Interface for route info
	interface RouteInfo {
		route_id?: string;
		short_name?: string;
		long_name?: string;
		color?: string;
		text_color?: string;
		agency_id?: string;
		route_type?: number;
	}

	// Route type categories: Rail (2), Metro (1), Tram (0), Bus (3), Other (everything else)
	function getRouteCategory(
		routeType: number | undefined
	): 'rail' | 'metro' | 'tram' | 'bus' | 'other' {
		switch (routeType) {
			case 2:
				return 'rail';
			case 1:
				return 'metro';
			case 0:
				return 'tram';
			case 3:
				return 'bus';
			default:
				return 'other';
		}
	}

	// Props
	export let routeIds: string[] = [];
	export let getRouteInfo: (routeId: string) => RouteInfo | undefined;
	// For GTFS stops, pass the chateau_id. For OSM stations, pass null/undefined
	export let chateau_id: string | null = null;

	// Computed values for UK National Rail grouping
	$: gwr_routes = routeIds.filter((r) => getRouteInfo(r)?.agency_id === 'GW');
	$: sw_routes = routeIds.filter((r) => getRouteInfo(r)?.agency_id === 'SW');
	$: sn_routes = routeIds.filter((r) => getRouteInfo(r)?.agency_id === 'SN');
	$: cc_routes = routeIds.filter((r) => getRouteInfo(r)?.agency_id === 'CC');
	$: le_routes = routeIds.filter((r) => getRouteInfo(r)?.agency_id === 'LE');

	$: grouped_route_ids = new Set([
		...gwr_routes,
		...sw_routes,
		...sn_routes,
		...cc_routes,
		...le_routes
	]);

	// Filter out grouped routes and sort by route type category
	$: ungrouped_routes = routeIds.filter((r) => !grouped_route_ids.has(r));
	$: rail_routes = ungrouped_routes.filter(
		(r) => getRouteCategory(getRouteInfo(r)?.route_type) === 'rail'
	);
	$: metro_routes = ungrouped_routes.filter(
		(r) => getRouteCategory(getRouteInfo(r)?.route_type) === 'metro'
	);
	$: tram_routes = ungrouped_routes.filter(
		(r) => getRouteCategory(getRouteInfo(r)?.route_type) === 'tram'
	);
	$: bus_routes = ungrouped_routes.filter(
		(r) => getRouteCategory(getRouteInfo(r)?.route_type) === 'bus'
	);
	$: other_routes = ungrouped_routes.filter(
		(r) => getRouteCategory(getRouteInfo(r)?.route_type) === 'other'
	);

	// Track which categories have content (including UK rail grouped routes for rail category)
	$: has_rail =
		gwr_routes.length > 0 ||
		sw_routes.length > 0 ||
		sn_routes.length > 0 ||
		cc_routes.length > 0 ||
		le_routes.length > 0 ||
		rail_routes.length > 0;
	$: has_metro = metro_routes.length > 0;
	$: has_tram = tram_routes.length > 0;
	$: has_bus = bus_routes.length > 0;
	$: has_other = other_routes.length > 0;

	// Check if a route should show MTA bullet
	function shouldShowMtaBullet(routeId: string, routeInfo: RouteInfo | undefined): boolean {
		if (!isSubwayRouteId(routeId)) return false;
		// For GTFS stops, check chateau_id
		if (chateau_id) return chateau_id === MTA_CHATEAU_ID;
		// For OSM stations, check agency_id
		return routeInfo?.agency_id === 'Metropolitan Transportation Authority';
	}

	// Check if a route should show RATP bullet
	function shouldShowRatpBullet(routeInfo: RouteInfo | undefined): boolean {
		if (!routeInfo?.short_name || !isRatpRoute(routeInfo.short_name)) return false;
		// For GTFS stops, check chateau_id
		if (chateau_id) return chateau_id === IDFM_CHATEAU_ID;
		// For OSM stations, check agency_id
		return routeInfo?.agency_id?.includes('Île-de-France') ?? false;
	}
</script>

<div class="flex flex-row gap-x-0.5 w-full flex-wrap gap-y-1 items-center">
	<!-- RAIL category (UK grouped routes + rail_routes) -->
	{#if gwr_routes.length > 0}
		<div class="flex flex-row items-center mr-2 bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">
			<img
				src="https://maps.catenarymaps.org/agencyicons/GreaterWesternRailway.svg"
				alt="Great Western Railway"
				class="h-3 inline-block dark:hidden mr-1"
			/>
			<img
				src="https://maps.catenarymaps.org/agencyicons/GreaterWesternRailway.svg"
				alt="Great Western Railway"
				class="h-3 hidden dark:inline-block mr-1"
			/>
			<span class="text-xs font-semibold">Great Western Railway</span>
		</div>
	{/if}

	{#if sw_routes.length > 0}
		<div class="flex flex-row items-center mr-2 bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">
			<img
				src="https://maps.catenarymaps.org/agencyicons/SouthWesternRailway.svg"
				alt="South Western Railway"
				class="h-3 inline-block mr-1"
			/>
			<span class="text-xs font-semibold">South Western Railway</span>
		</div>
	{/if}

	{#if sn_routes.length > 0}
		<div class="flex flex-row items-center mr-2 bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">
			<img
				src="https://maps.catenarymaps.org/agencyicons/SouthernIcon.svg"
				alt="Southern"
				class="h-3 inline-block mr-1"
			/>
			<span class="text-xs font-semibold">Southern</span>
		</div>
	{/if}

	{#if cc_routes.length > 0}
		<div class="flex flex-row items-center mr-2 bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">
			<img
				src="https://maps.catenarymaps.org/agencyicons/c2c_logo.svg"
				alt="c2c"
				class="h-3 inline-block mr-1"
			/>
			<span class="text-xs font-semibold">c2c</span>
		</div>
	{/if}

	{#if le_routes.length > 0}
		<div class="flex flex-row items-center mr-2 bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">
			<span class="text-xs font-semibold">Greater Anglia</span>
		</div>
	{/if}

	{#each rail_routes as routeId}
		{@const routeInfo = getRouteInfo(routeId)}
		{#if routeInfo}
			{#if shouldShowMtaBullet(routeId, routeInfo)}
				<MtaBullet route_short_name={routeInfo.short_name} matchTextHeight={false} />
			{:else if shouldShowRatpBullet(routeInfo)}
				<RatpBullet route_short_name={routeInfo.short_name} matchTextHeight={false} />
			{:else}
				<div
					class="px-1 py-0.5 md:py-1 text-xs rounded-sm"
					style={`background-color: ${routeInfo.color}; color: ${routeInfo.text_color};`}
				>
					{#if routeInfo.short_name}
						<span class="font-medium">{routeInfo.short_name}</span>
					{:else if routeInfo.long_name}
						{routeInfo.long_name.replace(' Line', '')}
					{/if}
				</div>
			{/if}
		{/if}
	{/each}

	<!-- Separator after RAIL -->
	{#if has_rail && (has_metro || has_tram || has_bus || has_other)}
		<span class="text-gray-400 dark:text-gray-600 mx-1">|</span>
	{/if}

	<!-- METRO category -->
	{#each metro_routes as routeId}
		{@const routeInfo = getRouteInfo(routeId)}
		{#if routeInfo}
			{#if shouldShowMtaBullet(routeId, routeInfo)}
				<MtaBullet route_short_name={routeInfo.short_name} matchTextHeight={false} />
			{:else if shouldShowRatpBullet(routeInfo)}
				<RatpBullet route_short_name={routeInfo.short_name} matchTextHeight={false} />
			{:else}
				<div
					class="px-1 py-0.5 md:py-1 text-xs rounded-sm"
					style={`background-color: ${routeInfo.color}; color: ${routeInfo.text_color};`}
				>
					{#if routeInfo.short_name}
						<span class="font-medium">{routeInfo.short_name}</span>
					{:else if routeInfo.long_name}
						{routeInfo.long_name.replace(' Line', '')}
					{/if}
				</div>
			{/if}
		{/if}
	{/each}

	<!-- Separator after METRO -->
	{#if has_metro && (has_tram || has_bus || has_other)}
		<span class="text-gray-400 dark:text-gray-600 mx-1">|</span>
	{/if}

	<!-- TRAM category -->
	{#each tram_routes as routeId}
		{@const routeInfo = getRouteInfo(routeId)}
		{#if routeInfo}
			{#if shouldShowMtaBullet(routeId, routeInfo)}
				<MtaBullet route_short_name={routeInfo.short_name} matchTextHeight={false} />
			{:else if shouldShowRatpBullet(routeInfo)}
				<RatpBullet route_short_name={routeInfo.short_name} matchTextHeight={false} />
			{:else}
				<div
					class="px-1 py-0.5 md:py-1 text-xs rounded-sm"
					style={`background-color: ${routeInfo.color}; color: ${routeInfo.text_color};`}
				>
					{#if routeInfo.short_name}
						<span class="font-medium">{routeInfo.short_name}</span>
					{:else if routeInfo.long_name}
						{routeInfo.long_name.replace(' Line', '')}
					{/if}
				</div>
			{/if}
		{/if}
	{/each}

	<!-- Separator after TRAM -->
	{#if has_tram && (has_bus || has_other)}
		<span class="text-gray-400 dark:text-gray-600 mx-1">|</span>
	{/if}

	<!-- BUS category -->
	{#each bus_routes as routeId}
		{@const routeInfo = getRouteInfo(routeId)}
		{#if routeInfo}
			{#if shouldShowMtaBullet(routeId, routeInfo)}
				<MtaBullet route_short_name={routeInfo.short_name} matchTextHeight={false} />
			{:else if shouldShowRatpBullet(routeInfo)}
				<RatpBullet route_short_name={routeInfo.short_name} matchTextHeight={false} />
			{:else}
				<div
					class="px-1 py-0.5 md:py-1 text-xs rounded-sm"
					style={`background-color: ${routeInfo.color}; color: ${routeInfo.text_color};`}
				>
					{#if routeInfo.short_name}
						<span class="font-medium">{routeInfo.short_name}</span>
					{:else if routeInfo.long_name}
						{routeInfo.long_name.replace(' Line', '')}
					{/if}
				</div>
			{/if}
		{/if}
	{/each}

	<!-- Separator after BUS -->
	{#if has_bus && has_other}
		<span class="text-gray-400 dark:text-gray-600 mx-1">|</span>
	{/if}

	<!-- OTHER category -->
	{#each other_routes as routeId}
		{@const routeInfo = getRouteInfo(routeId)}
		{#if routeInfo}
			{#if shouldShowMtaBullet(routeId, routeInfo)}
				<MtaBullet route_short_name={routeInfo.short_name} matchTextHeight={false} />
			{:else if shouldShowRatpBullet(routeInfo)}
				<RatpBullet route_short_name={routeInfo.short_name} matchTextHeight={false} />
			{:else}
				<div
					class="px-1 py-0.5 md:py-1 text-xs rounded-sm"
					style={`background-color: ${routeInfo.color}; color: ${routeInfo.text_color};`}
				>
					{#if routeInfo.short_name}
						<span class="font-medium">{routeInfo.short_name}</span>
					{:else if routeInfo.long_name}
						{routeInfo.long_name.replace(' Line', '')}
					{/if}
				</div>
			{/if}
		{/if}
	{/each}
</div>
