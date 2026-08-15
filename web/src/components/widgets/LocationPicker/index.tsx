import useColorValue from "@/root/src/hooks/useColorValue";
import { nullOrEmpty } from "@/root/src/utils/f";
import { Box, HStack, Text, VStack } from "@chakra-ui/react"
import { Loader } from '@googlemaps/js-api-loader'
import { useEffect, useRef, useState } from "react";
import InputBox from "../InputBox"
import Loading from "../Loading";

interface AutoCompleteOptions {
    types: string[],
    fields?: string[],
    strictBounds?: boolean,
    componentRestrictions?: {
        country?: string
    }
}

interface LatLng {
    lat: number,
    lng: number
}
interface Location {
    lat: () => number,
    lng: () => number
}
export interface Place {
    name: string, 
    formatted_address: string,
    geometry: {
        location: Location,
        viewport: {
            [x: string]: any
        }
    }
}
interface FunctionlessGeometry {
    location: {
        lat: number,
        lng: number
    },
    location_type: string,
    viewport: {
        south: number,
        west: number,
        north: number,
        east: number
    }
}
const AddressComponentTypes: {[x: string]: string} = {
    street_number: "street_number",
    route: "route",
    political: "political",
    locality: "locality",
    sublocality: "sublocality",
    sublocality_level_1: "sublocality_level_1",
    administrative_area_level_1: "administrative_area_level_1",
    administrative_area_level_2: "administrative_area_level_2",
    postal_code: "postal_code"
}
interface AddressComponent {
    long_name: string,
    short_name: string,
    types: string[]//AddressComponentTypes
}
const GeoCodeTypes: {[x: string]: string} = {
    street_address: "street_address",
    establishment: "establishment",

    route: "route",
    political: "political",
    locality: "locality",
    sublocality: "sublocality",
    sublocality_level_1: "sublocality_level_1",
    administrative_area_level_1: "administrative_area_level_1",
    administrative_area_level_2: "administrative_area_level_2",
    postal_code: "postal_code"
}
interface GeoCode {
    address_components: AddressComponent[],
    formatted_address: string,
    geometry: FunctionlessGeometry,
    place_id: string,
    plus_code: {
        compound_code: string,
        global_code: string
    },
    types: string[]//GeoCodeTypes
}

const ADDRESS_COMPONENT_NOTABLE_NAMES_TYPES = [
    "point_of_interest", "natural_feature", "park", "airport", "premise", "neighborhood"
]

interface LocationPicker {
    apiKey: string,
    value?: Place,
    onChange?: (place: Place) => void,
    onBlur?: (place: Place) => void,
    mapToSearchRatio?: number,
    searchPlaceholder?: string,
    twoDigitCountryCode?: string,
    defaultLatlng?: LatLng,
    geotype?: string,
    errorMessage?: any,
    [x: string]: any
}

const LocationPicker: React.FC<LocationPicker> = ({
    apiKey, mapToSearchRatio=(70/30), onChange, onBlur,
    searchPlaceholder, twoDigitCountryCode, 
    defaultLatlng= { lat: 6.4474, lng: 3.3903 }, value,
    geotype="establishment", errorMessage,
    ...props}) => {

    const loader = new Loader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["places"]
    })

    const inputRef = useRef()

    const [ mapLoadingDone, setMapLoadingDone ] = useState<boolean>()
    const [loadCalled, setLoadCalled] = useState<boolean>()

    const [place, setPlace] = useState<Place>()
    const [address, setAddress] = useState<string>()
    

    const fallbackGeoType = "route"

    const geoCodeToPlace = (geocode?: GeoCode): Place | undefined => {
        if(!geocode) return undefined
        var name = ""
        for(const addressComponent of geocode.address_components) {
            for(const addressComponentType of addressComponent.types) {
                if(ADDRESS_COMPONENT_NOTABLE_NAMES_TYPES.includes(addressComponentType)) {
                    name = addressComponent.long_name
                    break
                }
            }
        }
        const p = {
            name: name, 
            formatted_address: geocode?.formatted_address,
            geometry: {
                location: {
                    lat: () => geocode?.geometry?.location?.lat,
                    lng: () => geocode?.geometry?.location?.lng
                },
                viewport: geocode?.geometry?.viewport
            }
        }

        return p
    }

    const loadMap = (google: any, latLng: LatLng) => {
        const mapOptions = {
            center: new google.maps.LatLng(latLng.lat, latLng.lng),
            zoom: 13,
            mapTypeControl: false
        }
    
        const options: AutoCompleteOptions = {
            fields: ["formatted_address", "geometry", "name"],
            strictBounds: false,
            types: [geotype],
        }
    
        if(twoDigitCountryCode) {
            options.componentRestrictions = { country: twoDigitCountryCode.toLowerCase() }
        }

        const map = new google.maps.Map(document.getElementById("map"), mapOptions)

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, options)
        // Bind the map's bounds (viewport) property to the autocomplete object,
        // so that the autocomplete requests use the current map bounds for the
        // bounds option in the request.

        autocomplete.bindTo("bounds", map)
        const infowindow = new google.maps.InfoWindow();
        const infowindowContent = document.getElementById(
            "infowindow-content"
        ) as HTMLElement
        infowindow.setContent(infowindowContent)

        const marker = new google.maps.Marker({
            map,
            anchorPoint: new google.maps.Point(0, -29),
            position: new google.maps.LatLng(latLng.lat, latLng.lng),
            draggable: true
        })

        const updatePlace = (place?: Place) => {
            if(place) {
                //console.log("Place:updatePlace", place)
                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport)

                } else {
                    map.setCenter(place.geometry.location)
                    map.setZoom(18)
                }

                const contentChildren: {[x: string]: any} = infowindowContent.children
                contentChildren["place-name"].textContent = place.name;
                contentChildren["place-address"].textContent = place.formatted_address;
                infowindow.open(map, marker);

                setPlace(place)
                if(onChange) onChange(place)
            }
        }

        const geocoder = new google.maps.Geocoder()
        const onLocationSelected = (location: Location, place?: Place, placeId?: string) => {
            //console.log("Place:infowindow", "marker", marker, "map", map)
            marker.setPosition(location)
            marker.setVisible(true)
            // Center of map
            map.setCenter(location)
            //If only location is available without the place(name and formated_address)
            if(!place && (placeId || location)) {
                const ops = placeId? {placeId: placeId} : {latLng: location}
                geocoder.geocode(ops, (results: GeoCode[], status: string) => {
                    
                    if(status == google.maps.GeocoderStatus.OK && results) {

                        //console.log("Place:onLocationSelected.results", results)

                        var firstGeoChoice = results[0]; var secondGeoChoice;/*
                        for(const geocode of results) {
                            if(geocode.types.includes(geotype)) {
                                firstGeoChoice = geocode
                                break

                            } else if(geocode.types.includes(fallbackGeoType)) {
                                secondGeoChoice = geocode

                            }
                        }*/
                        updatePlace(geoCodeToPlace(firstGeoChoice || secondGeoChoice))
                    }
                })

            } else {
                updatePlace(place)
            }
        }

        autocomplete.addListener("place_changed", async () => {
            infowindow.close()
            marker.setVisible(false)
        
            const place: Place = await autocomplete.getPlace()
        
            if (!place.geometry || !place.geometry.location) {
              // User entered the name of a Place that was not suggested and
              // pressed the Enter key, or the Place Details request failed.
              //window.alert("No details available for input: '" + place.name + "'");
              return;
            }
        
            onLocationSelected(place.geometry.location, place)

            // Center of map
            //map.panTo(new google.maps.LatLng(latitude, longitude))
            //console.log("Place:autocomplete", place, "geo.lat", place.geometry.location.lat(), "geo.lng", place.geometry.location.lng())
        })

        //Add location click listener to the map
        google.maps.event.addListener(map, "click", (event: {latLng: Location, placeId: string}) => {
            //const placeId: string = event.placeId

            onLocationSelected(event.latLng)
            //console.log("Place:mapClick", event)
        })

        // Add click listener to the maker so the location can be reselected 
        marker.addListener('click', (event: {latLng: Location}) => {
            //const placeId: string = event.placeId

            onLocationSelected(event.latLng)
            //console.log("Place:markerClick", event)
        })

        //Detect when the map has been fully loaded the first time
        google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
            //console.log("mapLoaded:", true)
            setMapLoadingDone(true)
        })
    }

    const getCurrentLocation = (): Promise<LatLng> => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                }, error => {
                    reject(error)
                })
            } else {
                reject("Geolocation is not supported by your browser.")
            }
        })
    }

    useEffect(() => {
        if(!loadCalled) {
            loader.load()
            .then((google) => {
                if(value) {
                    const latLng = { lat: value.geometry.location.lat(), lng: value.geometry.location.lng()}
                    //console.log("getCurrentLocation:fromValue", latLng)
                    loadMap(google, latLng)

                } else {
                    getCurrentLocation()
                    .then(latLng => {
                        //console.log("getCurrentLocation:result", latLng)
                        loadMap(google, latLng)
                    })
                    .catch((e: GeolocationPositionError) => {
                        //console.log("getCurrentLocation:error", e)
                        loadMap(google, defaultLatlng)
                    })
                }
            })
            .catch(e => {
                // do something
                //console.log("loadCalled:error", e.message)
            })
            //setLoadCalled(true)
        }
    }, [])

    const ratioPartToPercentage = (ratio: number, isNumerator: boolean) => {
        return ((isNumerator? ratio : 1) * 100) / (ratio + 1)
    }

    const [ search, setSearch ] = useState<string>("")

    return (
        <Box width="100%" h="100%" pb="2rem" {...props}>
            <Box w="100%" h={`${ratioPartToPercentage(mapToSearchRatio, true)}%`} position="relative">
                <Box w="100%" h="100%">
                    <Box id="map" w="100%" h="100%"
                        borderTopLeftRadius="12px" borderTopRightRadius="12px"
                    />
                    <Box id="infowindow-content" display="inline">
                        <Text as="span" id="place-name" fontWeight="700"></Text>&nbsp;
                        <Text as="span" id="place-address"></Text>
                    </Box>
                </Box>
                <VStack display={!mapLoadingDone? "flex" : "none"} w="100%" h="100%" 
                    bg="rgba(0,0,0,.4)"
                    position="absolute" left="0" top="0" right="0" bottom="0"
                    justifyContent="center" alignItems="center">
                    <Loading type={Loading.TYPES.grid} 
                        color={useColorValue("colorAccent.light", "colorAccent.dark")} 
                        size="50px"
                    />
                    <Text as="div" mt="1rem" w="100%" fontStyle="italic" textAlign="center">
                        Loading map...
                    </Text>
                </VStack>
            </Box>
            <Box w="100%" h={`${ratioPartToPercentage(mapToSearchRatio, false)}%`}>
                <InputBox w="100%" inputRef={inputRef} disabled={!mapLoadingDone} mt="1rem"
                    title={"Find a place"}
                    type={InputBox.TYPES.text}
                    placeholder={searchPlaceholder || "Enter location name"} 
                    value={search} 
                    onChange={v => { 
                        setSearch(v)
                    }} 
                    errorMessage={errorMessage} 
                    helperText={
                        place? <Box display="inline">
                        <Text as="span" fontWeight="700">{place.name || value?.name}</Text>&nbsp;
                        <Text as="span">{place.formatted_address || value?.formatted_address}</Text>
                    </Box> : null
                    }
                    mx="0rem !important"
                    maxWidth="400px"
                />
                <style jsx global={true}>
                    {`
                        .pac-container {
                            z-index: 9999 !important;
                        }
                    `}
                </style>
            </Box>
            
        </Box>
    )
}

export default LocationPicker