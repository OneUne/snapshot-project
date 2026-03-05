// snapshot.js
const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");

const sharp = require("sharp");

const execAsync = promisify(exec);
const SAVE_DIR = "./snapshots";

// --monitors=N 파라미터 파싱 (기본값: 1)
const monitorsArg = process.argv.find((a) => a.startsWith("--monitors="));
const MONITOR_COUNT = monitorsArg ? parseInt(monitorsArg.split("=")[1], 10) : 1;

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

  // 임시 파일 목록 (나중에 삭제)
  const tempFiles = ["cam.jpg", "combined.jpg"];

  try {
    console.log(`📸 스냅샷 촬영 중... (모니터 ${MONITOR_COUNT}대)`);

    if (!fs.existsSync(todayFolder)) {
      fs.mkdirSync(todayFolder, { recursive: true });
    }

    // 1. 웹캠 촬영
    console.log("1. 웹캠 촬영...");
    await execAsync(
      'ffmpeg -f avfoundation -video_size 1280x720 -framerate 30 -i "0:" -vframes 1 -y cam.jpg',
    );

    // 2. 모니터별 스크린샷 촬영 (실패한 디스플레이는 건너뜀)
    console.log(`2. 스크린샷 촬영 (최대 ${MONITOR_COUNT}대)...`);
    const capturedFiles = [];
    for (let i = 1; i <= MONITOR_COUNT; i++) {
      const rawFile = `screen_${i}.jpg`;
      try {
        await execAsync(`screencapture -D ${i} ${rawFile}`);
        // 파일이 실제로 생성됐는지 확인
        if (fs.existsSync(rawFile) && fs.statSync(rawFile).size > 0) {
          tempFiles.push(rawFile);
          capturedFiles.push(rawFile);
          console.log(`   ✅ 디스플레이 ${i} 캡처 완료`);
        } else {
          console.log(`   ⚠️  디스플레이 ${i} 없음 (건너뜀)`);
        }
      } catch {
        console.log(`   ⚠️  디스플레이 ${i} 캡처 실패 (건너뜀)`);
      }
    }

    if (capturedFiles.length === 0) {
      throw new Error("캡처된 모니터가 없습니다.");
    }
    console.log(`   → ${capturedFiles.length}대 캡처됨`);

    // 3. 모니터 이미지 가로로 합치기 (캡처된 수에 따라 높이 축소)
    console.log("3. 모니터 이미지 합성...");
    const n = capturedFiles.length;
    const targetH = n >= 4 ? 160 : n === 3 ? 200 : n === 2 ? 270 : 400;
    const screenCombinedFile = "screens_combined.jpg";
    tempFiles.push(screenCombinedFile);

    if (n === 1) {
      await execAsync(
        `ffmpeg -i ${capturedFiles[0]} -vf scale=-1:${targetH} -y ${screenCombinedFile}`,
      );
    } else {
      const inputs = capturedFiles.map((f) => `-i ${f}`).join(" ");
      const scaleFilters = capturedFiles
        .map((_, i) => `[${i}:v]scale=-1:${targetH}[v${i}]`)
        .join(";");
      const stackInputs = capturedFiles.map((_, i) => `[v${i}]`).join("");
      await execAsync(
        `ffmpeg ${inputs} -filter_complex "${scaleFilters};${stackInputs}hstack=inputs=${n}" -y ${screenCombinedFile}`,
      );
    }

    // 4. 웹캠 + 스크린 합성
    console.log("4. 웹캠 오버레이 합성...");
    await execAsync(
      `ffmpeg -i cam.jpg -i ${screenCombinedFile} -filter_complex "[0:v][1:v]overlay=10:10" -y combined.jpg`,
    );

    // 5. 타임스탬프 추가 (sharp + SVG)
    console.log("5. 타임스탬프 추가...");
    const timeDisplay = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    const finalPath = `${todayFolder}/snapshot_${timestamp}.jpg`;
    const svgText = Buffer.from(
      `<svg width="160" height="44">
        <rect x="0" y="0" width="160" height="44" rx="4" fill="rgba(0,0,0,0.7)"/>
        <text x="80" y="30" font-family="monospace" font-size="22" fill="white" text-anchor="middle">${timeDisplay}</text>
      </svg>`,
    );
    const { width, height } = await sharp("combined.jpg").metadata();
    await sharp("combined.jpg")
      .composite([{ input: svgText, top: height - 54, left: width - 170 }])
      .jpeg({ quality: 90 })
      .toFile(finalPath);

    await execAsync(`rm -f ${tempFiles.join(" ")}`);
    console.log(`✅ 완료: ${todayFolder}/snapshot_${timestamp}.jpg`);
  } catch (error) {
    // 에러 시에도 임시 파일 정리 시도
    execAsync(`rm -f ${tempFiles.join(" ")}`).catch(() => {});
    console.error("❌ 에러:", error.message);
  }
}

async function main() {
  console.log(`📷 스냅샷 촬영 시작! (모니터 ${MONITOR_COUNT}대)`);
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
      `ffmpeg -framerate 33 -pattern_type glob -i '${targetFolder}/*.jpg' -c:v libx264 -pix_fmt yuv420p -y "${outputFile}"`,
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

// 사용법: node auto-snapshot.js [--monitors=N] [video]
if (process.argv.includes("video")) {
  createVideoFromSnapshots();
} else {
  main();
}
