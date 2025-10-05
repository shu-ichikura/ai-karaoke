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

  const selectedUser = tabIndex < users.length ? users[tabIndex] : null;
  const selectedData = selectedUser
    ? history.filter((item) => item.user === selectedUser)
    : [];

  const totalData = users
    .map((user) => {
      const userHistory = history.filter((item) => item.user === user);
      const scoreSum = userHistory.reduce(
        (sum, item) => sum + (item.keywordScore || 0),
        0
      );
      const vocalScoreSum = userHistory.reduce(
        (sum, item) => sum + (parseInt(item.vocalScore) || 0),
        0
      );
      return {
        user,
        scoreSum,
        vocalScoreSum,
        totalSum: scoreSum + vocalScoreSum,
      };
    })
    .sort((a, b) => b.totalSum - a.totalSum);

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
        <Tab label="TOTAL" />
      </Tabs>

      {tabIndex < users.length ? (
        <Paper elevation={3} sx={{ mt: 2, p: 2, overflowX: 'auto' }}>
          <Box minWidth="sm">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '30%' }}>お題</TableCell>
                  <TableCell sx={{ width: '30%' }}>曲名</TableCell>
                  <TableCell sx={{ width: '20%' }}>スコア</TableCell>
                  <TableCell sx={{ width: '20%' }}>歌唱スコア</TableCell>
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
      ) : (
        <Paper elevation={3} sx={{ mt: 2, p: 2, overflowX: 'auto' }}>
          <Box minWidth="sm">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>順位</TableCell>
                  <TableCell>ユーザ</TableCell>
                  <TableCell>ワードスコア</TableCell>
                  <TableCell>歌唱スコア</TableCell>
                  <TableCell>合計</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {totalData.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell>{item.scoreSum}</TableCell>
                    <TableCell>{item.vocalScoreSum}</TableCell>
                    <TableCell>{item.totalSum}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}
      {/*採点履歴詳細モーダル */}
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
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>出現ワード:</strong> {selectedItem.targetWordText || '—'}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>コメント:</strong> {selectedItem.comment || '—'}
            </Typography>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default ScoringResults;
