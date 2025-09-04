'use client';

import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Box,
  Divider,
  IconButton,
  Modal,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CircularProgress from '@mui/material/CircularProgress';
import ScoringResults from '../components/ScoringResults';
import { v4 as uuidv4 } from 'uuid';

type Keyword = {
  number: number;
  level: number;
  word: string;
};

type Entry = {
  name: string;
  artist: string;
  title: string;
  prompt: string;
  score: string;
  comment: string;
};

export default function Home() {
  const [currentKeyword, setCurrentKeyword] = useState<string>('お題がまだありません');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [remainingKeywords, setRemainingKeywords] = useState<Keyword[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [scoringResult, setScoringResult] = useState<{
    user: string;
    keyword: string;
    targetWordText: string;
    keywordScore: number;
    comment: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [modalUsers, setModalUsers] = useState<string[]>(['', '', '', '', '']);
  const [sessionId, setSessionId] = useState<string | null>(null);

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

    // currentKeywordからword部分だけを抽出
    const keywordMatch = currentKeyword.match(/：(.+)$/);
    const keyword = keywordMatch ? keywordMatch[1] : currentKeyword;

    const prompt = `セッションID：${sessionId}\nお題：${keyword}\nユーザ：${name}\n歌手名：${artist}\n曲名：${title}`;

    newEntries[index].prompt = prompt;
    setEntries(newEntries);

    // クリップボードにコピー
    navigator.clipboard.writeText(prompt);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleStartGame = () => {
    const filteredUsers = modalUsers.filter((user) => user.trim() !== '');
    if (filteredUsers.length > 0) {
      setUsers(filteredUsers);
      setSessionId(uuidv4());
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (users.length > 0) {
      setEntries(
        users.map((name) => ({
          name,
          artist: '',
          title: '',
          prompt: '',
          score: '',
          comment: '',
        }))
      );
    }
  }, [users]);

  // 採点結果受信
  const fetchScoringResult = async (sessionId: string, setScoringResult: Function) => {
    try {
      const res = await fetch(
        `https://i61gjpqf66.execute-api.ap-northeast-1.amazonaws.com/getScoringResult?sessionId=${sessionId}`
      );
      if (!res.ok) {
        console.warn('採点結果取得失敗: レスポンス異常');
        return;
      }

      const data = await res.json();
      console.log('採点結果取得:', data);

      if (data && typeof data === 'object' && data.keyword && data.user && data.keywordScore !== undefined) {
        setScoringResult(data);
      } else {
        console.warn('形式不正 or データなし:', data);
      }
    } catch (err) {
      console.error('採点結果取得エラー:', err);
    }
  };


  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Modal open={isModalOpen}>
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
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            ユーザーを入力してください
          </Typography>
          {modalUsers.map((user, index) => (
            <TextField
              key={index}
              fullWidth
              margin="dense"
              label={`ユーザー${index + 1}`}
              value={user}
              onChange={(e) => {
                const updatedUsers = [...modalUsers];
                updatedUsers[index] = e.target.value;
                setModalUsers(updatedUsers);
              }}
            />
          ))}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleStartGame}
            disabled={modalUsers.every((user) => user.trim() === '')}
          >
            ゲーム開始
          </Button>
        </Box>
      </Modal>

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
      {entries.length > 0 && entries.map((entry, i) => (
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
      {sessionId && (
        <Box textAlign="center" mb={2}>
          <Button
            variant="contained"
            onClick={() => {
              if (sessionId) fetchScoringResult(sessionId, setScoringResult);
            }}
          >
            採点結果を更新
          </Button>

        </Box>
      )}

      {scoringResult?.keyword && (
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
              <strong>ユーザ：</strong>{scoringResult?.user}
            </Typography>
            <Typography variant="body1">
              <strong>キーワード：</strong>{scoringResult?.keyword}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              <strong>出現ワード：</strong>{scoringResult?.targetWordText}
            </Typography>
            <Typography variant="h6" className="text-pink-700 font-bold mt-2">
              スコア：{scoringResult?.keywordScore} 点
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
              コメント：{scoringResult?.comment}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* 採点履歴 */}
      <Divider sx={{ my: 4 }} />
      {users.length > 0 && <ScoringResults users={users} />}
    </Container>
  );
}
