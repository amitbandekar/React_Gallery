import {
  CameraRoll,
  AssetType,
  Album,
} from '@react-native-camera-roll/camera-roll';
import {useCallback, useEffect, useState} from 'react';
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
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [photos, setPhotos] = useState<ImageDTO[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  const loadAlbums = useCallback(async () => {
    try {
      const fetchedAlbums = await CameraRoll.getAlbums({assetType: 'All'});
      setAlbums(fetchedAlbums);
    } catch (error) {
      console.warn('Failed to load albums:', error);
    }
  }, []);

  const loadNextPagePictures = useCallback(async () => {
    try {
      if (nextCursor) {
        setIsLoadingNextPage(true);
      } else {
        setIsLoading(true);
      }

      const params: any = {
        first: pageSize,
        after: nextCursor,
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
      setPhotos(prev => (nextCursor ? [...prev, ...newPhotos] : newPhotos));

      setNextCursor(page_info.end_cursor);
      setHasNextPage(page_info.has_next_page);
    } catch (error) {
      console.error('useGallery getPhotos error:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingNextPage(false);
    }
  }, [assetType, groupName, mimeTypeFilter, nextCursor, pageSize]);

  const refreshGallery = useCallback(async () => {
    try {
      setIsReloading(true);
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
      setPhotos(newPhotos);
      setNextCursor(page_info.end_cursor);
      setHasNextPage(page_info.has_next_page);
      loadAlbums();
    } catch (error) {
      console.error('useGallery refresh error:', error);
    } finally {
      setIsReloading(false);
    }
  }, [assetType, groupName, loadAlbums, mimeTypeFilter, pageSize]);

  const getUnloadedPictures = useCallback(async () => {
    try {
      setIsReloading(true);
      const count = photos.length > 0 ? photos.length : pageSize;
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
      setPhotos(newPhotos);
      setNextCursor(page_info.end_cursor);
      setHasNextPage(page_info.has_next_page);
      loadAlbums();
    } catch (error) {
      console.error('useGallery getUnloadedPictures error:', error);
    } finally {
      setIsReloading(false);
    }
  }, [
    assetType,
    groupName,
    loadAlbums,
    mimeTypeFilter,
    pageSize,
    photos.length,
  ]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

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
