import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text,Button } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler'; // Import ScrollView from gesture-handler
import {ImageDTO  } from './UseGallery';
import Gallery from 'react-native-image-gallery';

interface RemoteImage {
  source: { uri: string };
}
interface ImageViewerProps {
  images: RemoteImage[];
  selectedIndex: number | 0;
}
const imagess = [
  
  { source: { url: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQMjYrFKl1JFRSYQRRxSJUEn4oQy-Xc2f6isP63tmq9sJXHCyjp18p-0sxXO-et4TbAaSOEFUxWkUry6Js' } },
  { source: { uri: 'http://i.imgur.com/XP2BE7q.jpg' } },
  { source: { uri: 'http://i.imgur.com/XP2BE7q.jpg' } },
  { source: { url: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQMjYrFKl1JFRSYQRRxSJUEn4oQy-Xc2f6isP63tmq9sJXHCyjp18p-0sxXO-et4TbAaSOEFUxWkUry6Js' } },
  { source: { uri: 'http://i.imgur.com/XP2BE7q.jpg' } }
  
]
const imagdes = [{"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240501_141130.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240501_141126.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240501_141012.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240501_141000.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240501_140957.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240501_140938.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240501_140936.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240501_140913.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240501_140911.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240501_140742.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240501_140730.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-05-01-10-12-07-358_com.android.settings.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Images/IMG-20240501-WA0001.jpeg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-30-21-08-25-059_com.google.android.googlequicksearchbox.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-30-13-59-56-171_com.google.android.apps.nbu.paisa.user.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-29-22-34-45-339_com.instagram.android.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-29-22-34-41-795_com.instagram.android.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-28-20-23-50-179_com.example.practicalpractice.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-28-19-17-48-594_com.instagram.android.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/Pictures/WhatsApp/IMG-20240427-WA0014.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-27-16-02-40-893_com.instagram.android.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-26-22-54-48-203_com.supercell.clashroyale.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-26-22-54-41-661_com.supercell.clashroyale.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-26-22-54-38-350_com.supercell.clashroyale.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-26-22-15-22-471_com.whatsapp.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2024-04-26-12-08-51-489_com.gallery.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240426_111714.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240426_111710.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240426_111706.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240426_111703.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240426_111659.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240426_111655.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240425_214056.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240425_214025.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240425_203508.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240425_130850.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Images/IMG-20240424-WA0025.jpeg"}}, {"source": {"uri": "file:///storage/emulated/0/Pictures/1_fKQUHeIbZpMiBW8XC3M70A.png"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240417_213213.jpg"}}, {"source": {"uri": "file:///storage/emulated/0/DCIM/Camera/IMG_20240417_175912.jpg"}}];
const FullImageModal: React.FC<ImageViewerProps> = ({ images, selectedIndex}) => {
  console.log("this is log which is returned by this ::::"+images);
  return (
      <Gallery
      style={{ flex: 1, backgroundColor: 'black' }}
      images={images}
      initialPage={0}
    />
    )
}
export default FullImageModal;
