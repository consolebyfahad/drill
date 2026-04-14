/**
 * Responsive scaling utilities backed by react-native-size-matters.
 *
 * Guidelines:
 *   s()  - horizontal: padding, margin, width, icon size
 *   vs() - vertical: height, vertical padding/margin, line-height
 *   ms() - font sizes, border radii (default factor 0.3 = gentle scaling)
 */
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export const s = scale;
export const vs = verticalScale;
export const ms = (size: number, factor = 0.3) => moderateScale(size, factor);
