import { FeatureConfig, FeatureType } from './types';

export const FEATURE_CONFIGS: FeatureConfig[] = [
  {
    id: FeatureType.RECOGNITION,
    label: '一键识别',
    icon: 'scan',
    description: '智能分析图片内容、场景及人物特征',
    defaultPrompt: '详细分析这张图片，列出画面中的主要物体、人物情绪、环境背景以及艺术风格。',
    requiresInput: false
  },
  {
    id: FeatureType.SMOOTH_SKIN,
    label: '一键磨皮',
    icon: 'sparkles',
    description: '智能人像美容，磨皮祛痘，保留质感',
    defaultPrompt: 'Retouch the person in the image. Smooth the skin, remove blemishes and acne, improve skin tone uniformity while keeping skin texture natural. Apply professional studio lighting enhancement. High quality, photorealistic.',
    requiresInput: false
  },
  {
    id: FeatureType.FACE_SWAP,
    label: '一键换脸',
    icon: 'refresh',
    description: '将图片中的人物面部替换为指定特征',
    defaultPrompt: 'Replace the face of the person in the image with a face of a supermodel with a friendly smile.',
    requiresInput: true,
    inputLabel: '想要换成什么样的脸？(例如：换成亚洲明星脸，戴眼镜)'
  },
  {
    id: FeatureType.CHANGE_CLOTHES,
    label: '一键换衣',
    icon: 'shirt',
    description: '智能替换人物服装，自然贴合身体',
    defaultPrompt: 'Change the person\'s clothing to a formal business suit, dark blue color, clean and professional look. Keep the pose and body shape exactly the same.',
    requiresInput: true,
    inputLabel: '想要换成什么衣服？(例如：白色连衣裙，黑色西装)'
  },
  {
    id: FeatureType.CHANGE_BACKGROUND,
    label: '一键换背景',
    icon: 'image',
    description: '主体扣像，智能替换背景环境',
    defaultPrompt: 'Change the background to a futuristic cyberpunk city street with neon lights at night. Keep the foreground subject exactly as is with correct lighting integration.',
    requiresInput: true,
    inputLabel: '想要换成什么背景？(例如：海边沙滩，纯白背景)'
  }
];
