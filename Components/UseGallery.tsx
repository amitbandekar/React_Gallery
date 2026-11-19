import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {useCallback, useEffect, useState} from 'react';
import {AppState} from 'react-native';

interface GalleryOptions {
  pageSize?: number;
  mimeTypeFilter?: Array<string>;
}

export interface ImageDTO {
  source: {uri: string};
  dimensions?: {width: number; height: number};
}

export const convertCameraRollPicturesToImageDtoType = (
  edges: any[],
): ImageDTO[] => {
  return edges.map((edge: any) => ({
    source: {uri: edge.node.image.uri},
    dimensions: edge.node.image.playableDuration
      ? undefined
      : {
          width: edge.node.image.width,
          height: edge.node.image.height,
        },
  }));
};

export interface GalleryLogic {
  photos: ImageDTO[];
  loadNextPagePictures: () => void;
  getUnloadedPictures: () => void;
  isLoading: boolean;
  isLoadingNextPage: boolean;
  isReloading: boolean;
  hasNextPage: boolean;
}

const supportedMimeTypesByTheBackEnd = [
  'image/jpeg',
  'image/png',
  'image/heif',
  'image/heic',
  'image/heif-sequence',
  'image/heic-sequence',
];

export const useGallery = ({
  pageSize = 30,
  mimeTypeFilter = supportedMimeTypesByTheBackEnd,
}: GalleryOptions = {}): GalleryLogic => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [photos, setPhotos] = useState<ImageDTO[]>([]);

  const loadNextPagePictures = useCallback(async () => {
    try {
      if (nextCursor) {
        setIsLoadingNextPage(true);
      } else {
        setIsLoading(true);
      }
      const {edges, page_info} = await CameraRoll.getPhotos({
        first: pageSize,
        after: nextCursor,
        assetType: 'Photos',
        mimeTypes: mimeTypeFilter,
      });
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
  }, [mimeTypeFilter, nextCursor, pageSize]);

  const getUnloadedPictures = useCallback(async () => {
    try {
      setIsReloading(true);
      const count = photos.length > 0 ? photos.length : pageSize;
      const {edges, page_info} = await CameraRoll.getPhotos({
        first: count,
        assetType: 'Photos',
        mimeTypes: mimeTypeFilter,
      });
      const newPhotos = convertCameraRollPicturesToImageDtoType(edges);
      setPhotos(newPhotos);

      setNextCursor(page_info.end_cursor);
      setHasNextPage(page_info.has_next_page);
    } catch (error) {
      console.error('useGallery getUnloadedPictures error:', error);
    } finally {
      setIsReloading(false);
    }
  }, [mimeTypeFilter, pageSize, photos.length]);

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
    loadNextPagePictures,
    getUnloadedPictures,
    isLoading,
    isLoadingNextPage,
    isReloading,
    hasNextPage,
  };
};
