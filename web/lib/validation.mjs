export const normalize = value => value.replace(/\r\n?/g,'\n').trim();
export function validateSubmission(body) {
  if (!body || typeof body.submissionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.submissionId)) return '受付IDが正しくありません。';
  if(typeof body.movieId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(body.movieId)) return '見た作品を選んでください。';
  if(typeof body.comment !== 'string') return '感想を入力してください。';
  const n=Array.from(normalize(body.comment)).length;
  return n < 1 || n > 200 ? '感想は空白を除いて1～200文字で入力してください。' : null;
}
