'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Box,
  Divider,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CircularProgress from '@mui/material/CircularProgress';
import ScoringResults from '../components/ScoringResults';

type Keyword = {
  number: number;
  level: number;
  word: string;
};

export default function Home() {
  const [currentKeyword, setCurrentKeyword] = useState<string>('お題がまだありません');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [users, setUsers] = useState(['shui', 'yasuko']);
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState(
    users.map((name) => ({
      name,
      artist: '',
      title: '',
      prompt: '',
      score: '',
      comment: '',
    }))
  );

  // お題生成（API呼び出し）
  const fetchKeywords = async () => {
    setIsLoading(true);
    try {
      //ローカルのAPIコール
      //const res = await fetch('/api/generateKeywords');
      //AWSのAPIコール
      const res = await fetch('https://01r58ps5ud.execute-api.ap-northeast-1.amazonaws.com/prod/generateKeywords');
      const data = await res.json();

      if (!data.result || !Array.isArray(data.result)) {
        console.error('API戻り値に result が含まれていない:', data);
        setCurrentKeyword('お題の形式が不正です');
        return;
      }

      const parsed: Keyword[] = data.result;
      setKeywords(parsed);
      setCurrentKeyword('お題が準備できました。');
    } catch (err) {
      console.error('お題生成エラー:', err);
      setCurrentKeyword('お題の生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // お題ランダム出題
  const showRandomKeyword = () => {
    if (keywords.length === 0) {
      setCurrentKeyword('お題がまだ生成されていません');
      return;
    }
    const random = keywords[Math.floor(Math.random() * keywords.length)];
    setCurrentKeyword(`難易度${random.level}：${random.word}`);
  };

  const handlePromptGenerate = (index: number) => {
    const newEntries = [...entries];
    const { name, artist, title } = newEntries[index];

    const prompt = `ユーザ：${name}\n歌手名：${artist}\n曲名：${title}`;

    newEntries[index].prompt = prompt;
    setEntries(newEntries);

    // クリップボードにコピー
    navigator.clipboard.writeText(prompt);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* お題エリア */}
      <Box textAlign="center" mb={4}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>
          {currentKeyword}
        </Typography>

        {isLoading ? (
          <Box mt={2}><CircularProgress /></Box>
        ) : (
          <Box display="flex" gap={2} justifyContent="center" mt={2}>
            <Button variant="contained" onClick={fetchKeywords}>お題生成</Button>
            <Button variant="outlined" onClick={showRandomKeyword}>次のお題</Button>
          </Box>
        )}
      </Box>

      {/* 入力欄 */}
      {entries.map((entry, i) => (
        <Paper key={i} elevation={3} sx={{ p: 2, mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            ユーザー名：{entry.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            お題：{currentKeyword}
          </Typography>

          <TextField
            fullWidth
            label="アーティスト名"
            variant="outlined"
            margin="dense"
            value={entry.artist}
            onChange={(e) => {
              const updated = [...entries];
              updated[i].artist = e.target.value;
              setEntries(updated);
            }}
          />

          <TextField
            fullWidth
            label="曲名"
            variant="outlined"
            margin="dense"
            value={entry.title}
            onChange={(e) => {
              const updated = [...entries];
              updated[i].title = e.target.value;
              setEntries(updated);
            }}
          />

          <Button
            fullWidth
            variant="outlined"
            color="success"
            sx={{ mt: 1 }}
            onClick={() => handlePromptGenerate(i)}
          >
            採点プロンプト生成
          </Button>

          {entry.prompt && (
            <Box mt={2} display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" sx={{ flexGrow: 1, whiteSpace: 'pre-wrap' }}>
                {entry.prompt}
              </Typography>
              <IconButton onClick={() => handleCopy(entry.prompt)}>
                <ContentCopyIcon />
              </IconButton>
            </Box>
          )}
        </Paper>
      ))}

      {/* 採点結果 */}
      <Divider sx={{ my: 4 }} />
      <ScoringResults users={users} />
    </Container>
  );
}
