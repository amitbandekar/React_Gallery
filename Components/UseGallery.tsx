import {
  CameraRoll,
  AssetType,
  Album,
} from '@react-native-camera-roll/camera-roll';
import {useCallback, useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';

interface GalleryOptions {
  pageSize?: number;
  mimeTypeFilter?: Array<string>;
  groupName?: string;
  assetType?: AssetType;
}

export interface ImageDTO {
  source: {uri: string};
  id?: string;
  filename?: string | null;
  fileSize?: number | null;
  playableDuration?: number;
  timestamp?: number;
  width?: number;
  height?: number;
  type?: string;
}

export const convertCameraRollPicturesToImageDtoType = (
  edges: any[],
): ImageDTO[] => {
  return edges.map((edge: any) => ({
    source: {uri: edge.node.image.uri},
    id: edge.node.id || edge.node.image.uri,
    filename: edge.node.image.filename,
    fileSize: edge.node.image.fileSize,
    playableDuration: edge.node.image.playableDuration,
    timestamp: edge.node.timestamp,
    width: edge.node.image.width,
    height: edge.node.image.height,
    type: edge.node.type,
  }));
};

export interface GalleryLogic {
  photos: ImageDTO[];
  albums: Album[];
  loadNextPagePictures: () => void;
  getUnloadedPictures: () => Promise<void>;
  refreshGallery: () => Promise<void>;
  isLoading: boolean;
  isLoadingNextPage: boolean;
  isReloading: boolean;
  hasNextPage: boolean;
}

export const useGallery = ({
  pageSize = 30,
  mimeTypeFilter,
  groupName,
  assetType = 'All',
}: GalleryOptions = {}): GalleryLogic => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [photos, setPhotos] = useState<ImageDTO[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  // Refs for stable pagination state without re-triggering hooks
  const nextCursorRef = useRef<string | undefined>(undefined);
  const hasNextPageRef = useRef<boolean>(true);
  const loadingRef = useRef<boolean>(false);
  const photosLengthRef = useRef<number>(0);

  useEffect(() => {
    photosLengthRef.current = photos.length;
  }, [photos.length]);

  const loadAlbums = useCallback(async () => {
    try {
      const fetchedAlbums = await CameraRoll.getAlbums({assetType: 'All'});
      setAlbums(fetchedAlbums);
    } catch (error) {
      console.warn('Failed to load albums:', error);
    }
  }, []);

  const loadNextPagePictures = useCallback(async () => {
    // Guard against concurrent calls or when there are no more pages
    if (loadingRef.current) {
      return;
    }
    if (!hasNextPageRef.current && nextCursorRef.current) {
      return;
    }

    loadingRef.current = true;
    const isNext = Boolean(nextCursorRef.current);
    if (isNext) {
      setIsLoadingNextPage(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params: any = {
        first: pageSize,
        after: nextCursorRef.current,
        assetType,
        include: ['filename', 'fileSize', 'imageSize', 'playableDuration'],
      };

      if (mimeTypeFilter && mimeTypeFilter.length > 0) {
        params.mimeTypes = mimeTypeFilter;
      }
      if (groupName && groupName !== 'All') {
        params.groupName = groupName;
        params.groupTypes = 'Album';
      }

      const {edges, page_info} = await CameraRoll.getPhotos(params);
      const newPhotos = convertCameraRollPicturesToImageDtoType(edges);

      nextCursorRef.current = page_info.end_cursor;
      hasNextPageRef.current = page_info.has_next_page;
      setHasNextPage(page_info.has_next_page);

      setPhotos(prev => (isNext ? [...prev, ...newPhotos] : newPhotos));
    } catch (error) {
      console.error('useGallery getPhotos error:', error);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
      setIsLoadingNextPage(false);
    }
  }, [assetType, groupName, mimeTypeFilter, pageSize]);

  const refreshGallery = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    setIsReloading(true);
    nextCursorRef.current = undefined;
    hasNextPageRef.current = true;
    setHasNextPage(true);

    try {
      const params: any = {
        first: pageSize,
        assetType,
        include: ['filename', 'fileSize', 'imageSize', 'playableDuration'],
      };

      if (mimeTypeFilter && mimeTypeFilter.length > 0) {
        params.mimeTypes = mimeTypeFilter;
      }
      if (groupName && groupName !== 'All') {
        params.groupName = groupName;
        params.groupTypes = 'Album';
      }

      const {edges, page_info} = await CameraRoll.getPhotos(params);
      const newPhotos = convertCameraRollPicturesToImageDtoType(edges);

      nextCursorRef.current = page_info.end_cursor;
      hasNextPageRef.current = page_info.has_next_page;
      setHasNextPage(page_info.has_next_page);
      setPhotos(newPhotos);
      loadAlbums();
    } catch (error) {
      console.error('useGallery refresh error:', error);
    } finally {
      loadingRef.current = false;
      setIsReloading(false);
    }
  }, [assetType, groupName, loadAlbums, mimeTypeFilter, pageSize]);

  const getUnloadedPictures = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    setIsReloading(true);
    const count =
      photosLengthRef.current > 0 ? photosLengthRef.current : pageSize;

    try {
      const params: any = {
        first: count,
        assetType,
        include: ['filename', 'fileSize', 'imageSize', 'playableDuration'],
      };

      if (mimeTypeFilter && mimeTypeFilter.length > 0) {
        params.mimeTypes = mimeTypeFilter;
      }
      if (groupName && groupName !== 'All') {
        params.groupName = groupName;
        params.groupTypes = 'Album';
      }

      const {edges, page_info} = await CameraRoll.getPhotos(params);
      const newPhotos = convertCameraRollPicturesToImageDtoType(edges);

      nextCursorRef.current = page_info.end_cursor;
      hasNextPageRef.current = page_info.has_next_page;
      setHasNextPage(page_info.has_next_page);
      setPhotos(newPhotos);
      loadAlbums();
    } catch (error) {
      console.error('useGallery getUnloadedPictures error:', error);
    } finally {
      loadingRef.current = false;
      setIsReloading(false);
    }
  }, [assetType, groupName, loadAlbums, mimeTypeFilter, pageSize]);

  // Load albums on mount
  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  // Reset pagination and reload whenever filter or album changes
  useEffect(() => {
    nextCursorRef.current = undefined;
    hasNextPageRef.current = true;
    setHasNextPage(true);
    loadNextPagePictures();
  }, [groupName, assetType, loadNextPagePictures]);

  // Reload when app returns from background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        getUnloadedPictures();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [getUnloadedPictures]);

  return {
    photos,
    albums,
    loadNextPagePictures,
    getUnloadedPictures,
    refreshGallery,
    isLoading,
    isLoadingNextPage,
    isReloading,
    hasNextPage,
  };
};
