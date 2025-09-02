'use client';

import React, { useState } from 'react';
import { useEffect, useRef } from 'react';
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
  const [remainingKeywords, setRemainingKeywords] = useState<Keyword[]>([]);
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
  const [scoringResult, setScoringResult] = useState<{
    user: string;
    keyword: string;
    targetWordText: string;
    keywordScore: number;
    comment: string;
  } | null>(null);

  // お題生成（API呼び出し）
  const fetchKeywords = async () => {
    setIsLoading(true);
    try {
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
      setRemainingKeywords([...parsed]);
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
    if (remainingKeywords.length === 0) {
      setCurrentKeyword('すべてのお題を出題しました！再生成してください。');
      return;
    }

    const index = Math.floor(Math.random() * remainingKeywords.length);
    const chosen = remainingKeywords[index];

    const updated = [...remainingKeywords];
    updated.splice(index, 1); // 選ばれたお題を削除

    setRemainingKeywords(updated);
    setCurrentKeyword(`難易度${chosen.level}：${chosen.word}`);
  };

  // 採点プロンプト生成＆クリップボードコピー
  const handlePromptGenerate = (index: number) => {
    const newEntries = [...entries];
    const { name, artist, title } = newEntries[index];

    const prompt = `お題：${currentKeyword}\nユーザ：${name}\n歌手名：${artist}\n曲名：${title}`;

    newEntries[index].prompt = prompt;
    setEntries(newEntries);

    // クリップボードにコピー
    navigator.clipboard.writeText(prompt);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 採点結果受信
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
          const res = await fetch(
            'https://i61gjpqf66.execute-api.ap-northeast-1.amazonaws.com/getScoringResult?user=shui'
          );
          if (!res.ok) return;

          const data = await res.json();

          if (data?.keyword) {
            setScoringResult(data);
          }
      } catch (err) {
          console.error('採点結果取得エラー:', err);
      }
    }, 5000); // 5秒おきにポーリング

    return () => clearInterval(intervalId);
  }, []);

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

      {/* 選曲入力欄 */}
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
      {scoringResult && (
        <Paper
          elevation={6}
          sx={{ maxWidth: 'sm', mx: 'auto', bgcolor: 'background.paper', borderRadius: 2, p: 4, boxShadow: 3 }}
        >
          <Box className="text-center mb-4">
            <Typography variant="h5" className="font-bold tracking-wide">
              採点結果
            </Typography>
          </Box>

          <Box className="space-y-2 text-gray-800">
            <Typography variant="body1">
              <strong>ユーザ：</strong>{scoringResult.user}
            </Typography>
            <Typography variant="body1">
              <strong>キーワード：</strong>{scoringResult.keyword}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              <strong>出現ワード：</strong>{scoringResult.targetWordText}
            </Typography>
            <Typography variant="h6" className="text-pink-700 font-bold mt-2">
              スコア：{scoringResult.keywordScore} 点
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
              コメント：{scoringResult.comment}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* 採点履歴 */}
      <Divider sx={{ my: 4 }} />
      <ScoringResults users={users} />
    </Container>
  );
}
