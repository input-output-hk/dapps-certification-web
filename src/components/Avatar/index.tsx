import { useMemo } from 'react';
import { minidenticon } from 'minidenticons';
import MuiAvatar from '@mui/material/Avatar';

interface AvatarProps {
  seed: string;
  saturation?: number;
  lightness?: number;
  square?: boolean;
}

const Avatar = (props: AvatarProps) => {
  const size = props.square ? 100 : 40;
  const svgURI = useMemo(
    () => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(props.seed, props.saturation, props.lightness)),
    [props.seed, props.saturation, props.lightness]
  );
  return (
    <MuiAvatar
      src={svgURI}
      alt={props.seed}
      variant={props.square ? 'square' : 'circular'}
      sx={{
        backgroundColor: '#F0F0F6',
        width: size, height: size,
      }}
      {...props}
    />
  );
}

export default Avatar;