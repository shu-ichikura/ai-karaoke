import {
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Modal,
} from '@mui/material';
import { useState } from 'react';

interface ScoringResultsProps {
  users: string[];
  history: any[];
}

const ScoringResults: React.FC<ScoringResultsProps> = ({ users, history }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const selectedUser = users[tabIndex];
  const selectedData = history.filter((item) => item.user === selectedUser);

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        採点履歴
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={(_, newIndex) => setTabIndex(newIndex)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {users.map((user, index) => (
          <Tab key={index} label={user} />
        ))}
      </Tabs>

      <Paper elevation={3} sx={{ mt: 2, p: 2, overflowX: 'auto' }}>
        <Box minWidth={800}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>お題</TableCell>
                <TableCell>曲名</TableCell>
                <TableCell>スコア</TableCell>
                <TableCell>歌唱スコア</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedData.map((item, idx) => (
                <TableRow
                  key={idx}
                  onClick={() => handleRowClick(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{item.keyword}</TableCell>
                  <TableCell>{item.music || '—'}</TableCell>
                  <TableCell>{item.keywordScore}</TableCell>
                  <TableCell>{item.vocalScore || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {selectedItem && (
        <Modal open={true} onClose={handleCloseModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              詳細情報
            </Typography>
            <Typography variant="body1">
              <strong>お題:</strong> {selectedItem.keyword}
            </Typography>
            <Typography variant="body1">
              <strong>曲名:</strong> {selectedItem.music || '—'}
            </Typography>
            <Typography variant="body1">
              <strong>スコア:</strong> {selectedItem.keywordScore}
            </Typography>
            <Typography variant="body1">
              <strong>歌唱スコア:</strong> {selectedItem.vocalScore || '—'}
            </Typography>
            <Typography variant="body1">
              <strong>出現ワード:</strong> {selectedItem.targetWordText || '—'}
            </Typography>
            <Typography variant="body1">
              <strong>コメント:</strong> {selectedItem.comment || '—'}
            </Typography>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default ScoringResults;
