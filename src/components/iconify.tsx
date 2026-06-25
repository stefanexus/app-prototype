import { Icon, type IconProps } from '@iconify/react';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';

// ----------------------------------------------------------------------
// Thin wrapper around @iconify/react that behaves like an MUI Box so it
// accepts `sx`, `width`, colour, etc. Icons resolve from the Iconify API.
// ----------------------------------------------------------------------

type Props = BoxProps & {
  icon: IconProps['icon'];
  width?: number | string;
};

const Iconify = forwardRef<SVGElement, Props>(
  ({ icon, width = 24, sx, ...other }, ref) => (
    <Box
      ref={ref}
      component={Icon}
      icon={icon}
      sx={{
        width,
        height: width,
        flexShrink: 0,
        display: 'inline-flex',
        ...sx,
      }}
      {...other}
    />
  )
);

Iconify.displayName = 'Iconify';

export default Iconify;
