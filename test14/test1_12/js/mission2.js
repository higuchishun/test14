let fileCounter = 0;

// ハンバーガーメニューの表示/非表示を切り替える関数
function toggleMenu() {
  const menu = document.getElementById('menu');
  menu.classList.toggle('active');
}

// ファイルプレビューを表示する関数
function previewFile(input) {
  const fileData = new FileReader();
  fileData.onload = function () {
    const preview = document.getElementById('preview');
    preview.src = fileData.result;
    fileCounter++;
  };
  fileData.readAsDataURL(input.files[0]);
}

// ミッションを完了する関数
function completeMission() {
  if (fileCounter === 1) {
    // ポイントを加算
    let points = parseInt(localStorage.getItem('points')) || 0;
    points += 20;
    localStorage.setItem('points', points);

    // 撃破したアラートを表示
    alert('撃破した！');

    // 撃破後の画像に変更
    const targetImage = document.querySelector('img[alt="poteto"]');
    targetImage.src = 'img/toubatsu.png'; // 撃破後の画像パスに置き換える

    targetImage.style.width = '300px';
    targetImage.style.height = 'auto';

    // 画像に適用されているアニメーションやキーアニメーションのクラスを削除
    targetImage.classList.remove('keyframe', 'animation');

    // 撃破ボタンを非表示にする
    const completeButton = document.getElementById('complete-mission-button');
    completeButton.style.display = 'none';

    // 「次のミッションへ進む」ボタンを表示
    const nextMissionButton = document.getElementById('next-mission-button');
    nextMissionButton.style.display = 'inline-block'; // ボタンを表示
  } else {
    alert('料理を完成させろ');
  }
}

// 次のミッションに進む関数
function goToNextMission(missionNumber) {
  const nextMissionUrl = `mission1_${missionNumber}.html`;
  window.location.href = nextMissionUrl;
}
