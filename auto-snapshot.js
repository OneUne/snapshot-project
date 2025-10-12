// snapshot.js
const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");

const execAsync = promisify(exec);
const SAVE_DIR = "./snapshots";

function getTodayFolder() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  return `${SAVE_DIR}/${dateStr}`;
}

async function takeSnapshot() {
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, "0")}_${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}_${now.getSeconds().toString().padStart(2, "0")}`;
  const todayFolder = getTodayFolder();

  try {
    console.log("📸 스냅샷 촬영 중...");

    if (!fs.existsSync(todayFolder)) {
      fs.mkdirSync(todayFolder, { recursive: true });
    }

    // 1. 웹캠 촬영
    console.log("1. 웹캠 촬영...");
    await execAsync(
      'ffmpeg -f avfoundation -video_size 1280x720 -framerate 30 -i "0:" -vframes 1 -y cam.jpg'
    );

    // 2~5. 나머지 과정들...
    console.log("2. 스크린샷 촬영...");
    await execAsync("screencapture screen.jpg");
    await execAsync(
      "ffmpeg -i screen.jpg -vf scale=iw*0.2:ih*0.2 -y screen_small.jpg"
    );

    console.log("3. 이미지 합성...");
    await execAsync(
      `ffmpeg -i cam.jpg -i screen_small.jpg -filter_complex "[0:v][1:v]overlay=10:10" -y combined.jpg`
    );

    console.log("4. 타임스탬프 추가...");
    const timeDisplay = `${now.getHours().toString().padStart(2, "0")}\\:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}\\:${now.getSeconds().toString().padStart(2, "0")}`;
    await execAsync(
      `ffmpeg -i combined.jpg -vf "drawtext=text='${timeDisplay}':fontsize=30:fontcolor=white:x=w-tw-30:y=h-th-30:box=1:boxcolor=black@0.8:boxborderw=5" -y "${todayFolder}/snapshot_${timestamp}.jpg"`
    );

    await execAsync("rm -f cam.jpg screen.jpg screen_small.jpg combined.jpg");
    console.log(`✅ 완료: ${todayFolder}/snapshot_${timestamp}.jpg`);
  } catch (error) {
    console.error("❌ 에러:", error.message);
  }
}

async function main() {
  // 🔇 처음에 한 번만 소리 끄기
  // console.log("🔇 카메라 셔터음 끄는 중...");
  // await execAsync('sudo nvram SystemAudioVolume=" "');

  console.log("📷 스냅샷 촬영 시작!");
  setInterval(() => {
    takeSnapshot();
  }, 30_000);
}

async function createVideoFromSnapshots(folderPath = null) {
  try {
    const targetFolder = folderPath || getTodayFolder();

    if (!fs.existsSync(targetFolder)) {
      console.log(`❌ 폴더가 없습니다: ${targetFolder}`);
      return;
    }

    console.log(`🎬 스냅샷을 영상으로 변환 중... (${targetFolder})`);

    // 지정된 폴더의 모든 jpg 파일 찾기
    const files = fs
      .readdirSync(targetFolder)
      .filter((file) => file.endsWith(".jpg"))
      .sort(); // 파일명으로 정렬

    if (files.length === 0) {
      console.log(`❌ ${targetFolder} 폴더에 이미지가 없습니다.`);
      return;
    }

    console.log(`📊 총 ${files.length}개의 이미지를 찾았습니다.`);

    // ffmpeg를 사용하여 영상 생성
    // -framerate 10: 초당 10프레임 = 0.1초당 1프레임
    // -framerate 33: 초당 33프레임 = 0.03초당 1프레임
    // -framerate 50: 초당 50프레임 = 0.02초당 1프레임
    // -pattern_type glob: 파일 패턴 사용
    // -i: 입력 파일 패턴
    const outputFile = `${targetFolder}/timelapse_${Date.now()}.mp4`;

    await execAsync(
      `ffmpeg -framerate 33 -pattern_type glob -i '${targetFolder}/*.jpg' -c:v libx264 -pix_fmt yuv420p -y "${outputFile}"`
    );

    console.log(`✅ 영상 생성 완료: ${outputFile}`);
    console.log(`⏱️  총 영상 길이: ${(files.length * 0.03).toFixed(1)}초`);
  } catch (error) {
    console.error("❌ 영상 생성 중 에러:", error.message);
  }
}

// Cmd+C로 종료할 때 영상 생성 및 종료
process.on("SIGINT", async () => {
  console.log("\n\n🎬 영상 생성을 시작합니다...");
  await createVideoFromSnapshots();
  console.log("👋 프로그램 종료");
  process.exit();
});

// 사용법: node auto-snapshot.js video
if (process.argv[2] === "video") {
  createVideoFromSnapshots();
} else {
  main();
}
