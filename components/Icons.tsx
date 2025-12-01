import React from 'react';
import { 
  ScanFace, 
  Sparkles, 
  RefreshCcw, 
  Shirt, 
  Image as ImageIcon, 
  UploadCloud,
  Loader2,
  Wand2,
  Download
} from 'lucide-react';

export const IconScanFace = ({ className }: { className?: string }) => <ScanFace className={className} />;
export const IconSparkles = ({ className }: { className?: string }) => <Sparkles className={className} />;
export const IconRefresh = ({ className }: { className?: string }) => <RefreshCcw className={className} />;
export const IconShirt = ({ className }: { className?: string }) => <Shirt className={className} />;
export const IconImage = ({ className }: { className?: string }) => <ImageIcon className={className} />;
export const IconUpload = ({ className }: { className?: string }) => <UploadCloud className={className} />;
export const IconLoader = ({ className }: { className?: string }) => <Loader2 className={className} />;
export const IconWand = ({ className }: { className?: string }) => <Wand2 className={className} />;
export const IconDownload = ({ className }: { className?: string }) => <Download className={className} />;
