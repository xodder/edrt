import stringToRGB from '~/renderer/utils/string-to-rgb';
import { lighten, Box, Button, Typography } from '@mui/material';
import React from 'react';
import Screen from '~/renderer/screens/shared/screen';
import { Column, Row, Center, Spacer } from '~/renderer/screens/shared/layout';
import Divider from '~/renderer/screens/shared/divider';

const APPBAR_HEIGHT = 48;

const files = [
  { name: 'Untitled 1', type: '', content: '' },
  { name: 'Untitled 2', type: '', content: '' },
  { name: 'Untitled 3', type: '', content: '' },
  { name: 'Untitled 4', type: '', content: '' },
];

function MainScreen() {
  return (
    <Screen>
      <AppBar />
      <Row width={1} height={1}>
        <Column bgcolor="#1a1a1a" width={250}>
          <Box height={APPBAR_HEIGHT} />
          <Divider
            weight={6}
            width={72}
            color="grey.900"
            borderRadius="0 8px 8px 0"
          />
          <Spacer sy={2} />
          <XList />
        </Column>
        <Column flex={1}>
          <Box height={APPBAR_HEIGHT} />
          <Divider width={1} color="grey.900" />
        </Column>
      </Row>
    </Screen>
  );
}

function AppBar() {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width={1}
      height={APPBAR_HEIGHT}
      sx={{ '-webkit-app-region': 'drag' }}
    />
  );
}

function XList() {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  return (
    <Column height={1}>
      {files.map((file, index) => (
        <XListItem
          key={index}
          label={file.name}
          selected={selectedIndex === index}
          onClick={() => setSelectedIndex(index)}
        />
      ))}
    </Column>
  );
}

type XListItemProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

function XListItem({ label, selected, onClick }: XListItemProps) {
  const tint = stringToRGB(label);

  return (
    <Row
      px={2}
      py={1.45}
      gap={2}
      crossAxisAlignment="center"
      onClick={onClick}
      color={selected ? lighten(tint, 0.7) : 'text.secondary'}
      bgcolor={selected ? 'rgba(255, 255, 255, .025)' : undefined}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          color: !selected ? 'text.primary' : undefined,
        },
      }}
    >
      <Box
        width={20}
        height={20}
        borderRadius="50%"
        bgcolor={tint}
        border="1px solid"
        borderColor="white"
      />
      <Typography color="inherit">{label}</Typography>
    </Row>
  );
}

export default MainScreen;
