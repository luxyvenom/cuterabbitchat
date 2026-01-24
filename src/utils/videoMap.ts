import cocoVideo from '../assets/coco.mp4';
import jumprabbitVideo from '../assets/jumprabbit.mp4';
import jiniVideo from '../assets/jini.mp4';
import gojinVideo from '../assets/gojin.mp4';
import taekenVideo from '../assets/taeken.mp4';
import mimiVideo from '../assets/image/mimi.mp4';

type MediaType = 'video' | 'image';

interface MediaAsset {
  type: MediaType;
  src: string;
}

const MEDIA_MAP: Record<string, MediaAsset> = {
  '1': { type: 'video', src: cocoVideo },
  '2': { type: 'video', src: jumprabbitVideo },
  '3': { type: 'video', src: jiniVideo },
  '4': { type: 'video', src: gojinVideo },
  '5': { type: 'video', src: mimiVideo },
  '6': { type: 'video', src: taekenVideo },
};

export const getCharacterMedia = (characterId: string): MediaAsset => {
  return MEDIA_MAP[characterId] || { type: 'video', src: cocoVideo };
};

// Deprecated: kept for backward compatibility if needed, but we should switch
export const getCharacterVideo = (characterId: string): string => {
  const media = getCharacterMedia(characterId);
  return media.src;
};
