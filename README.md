# Auto Snapshot

> 일하는 동안 내 모습이 궁금하지 않으셨나요?
> Have you ever wondered how you look while you're working?

화면과 웹캠을 자동으로 캡처하여 작업 중 내 모습을 기록하는 도구입니다.
A tool that automatically captures your screen and webcam to record how you look while working.

## Features

- 🖥️ **화면 캡처** - 전체 화면 또는 특정 창을 자동으로 스크린샷
  **Screen Capture** - Automatically takes screenshots of the entire screen or specific windows
- 📸 **웹캠 캡처** - 작업 중인 당신의 모습을 자동으로 촬영
  **Webcam Capture** - Automatically takes photos of you while working
- ⏰ **자동 실행** - 설정된 간격으로 자동으로 스냅샷 생성
  **Auto Run** - Automatically creates snapshots at set intervals
- 📁 **자동 정리** - 날짜별로 폴더에 정리되어 저장
  **Auto Organization** - Automatically organized and saved in folders by date
- 🎬 **타임랩스 생성** - 스냅샷을 자동으로 타임랩스 영상으로 변환
  **Timelapse Creation** - Automatically converts snapshots into a timelapse video

## Platform

⚠️ **macOS only** - 현재 macOS에서만 동작합니다.
⚠️ **macOS only** - Currently only works on macOS.

이 도구는 macOS의 `screencapture` 명령어를 사용하기 때문에 macOS 환경에서만 작동합니다.

This tool uses macOS's `screencapture` command, so it only works on macOS.

## Requirements

- **Node.js** - JavaScript 런타임 / JavaScript runtime
- **FFmpeg** - 이미지 및 영상 처리 / Image and video processing
- **sharp** - 타임스탬프 텍스트 합성 (npm으로 자동 설치) / Timestamp text overlay (auto-installed via npm)

### FFmpeg 설치 / Installing FFmpeg

```bash
brew install ffmpeg
```

### 설치 / Installation

```bash
npm install
```

sharp가 자동으로 설치되며, 타임스탬프 텍스트 합성에 사용됩니다.
sharp is installed automatically and used for timestamp text overlay.

## Installation

```bash
# 저장소 클론 / Clone this repository
git clone https://github.com/OneUne/snapshot-project.git
cd snapshot-project

# Node.js 설치 확인 / Check Node.js installation
node --version
```

## Usage

### 스냅샷 자동 촬영 / Auto Snapshot

```bash
# 모니터 1대 (기본값) / Single monitor (default)
node auto-snapshot.js

# 모니터 N대 / Multiple monitors
node auto-snapshot.js --monitors=2
node auto-snapshot.js --monitors=3
```

- 스냅샷은 `snapshots/YYYY-MM-DD/` 폴더에 저장됩니다
  Snapshots are saved in the `snapshots/YYYY-MM-DD/` folder
- 멀티 모니터 사용 시 모든 화면을 가로로 합쳐서 저장됩니다
  With multiple monitors, all screens are combined horizontally
- `Ctrl+C`로 종료 시 자동으로 타임랩스 영상이 생성됩니다
  When stopped with `Ctrl+C`, a timelapse video is automatically created

### 타임랩스 영상만 생성 / Create Timelapse Video Only

```bash
# 오늘 촬영한 스냅샷으로 영상 생성 / Create video from today's snapshots
node auto-snapshot.js video

# 특정 날짜의 스냅샷으로 영상 생성 (코드 수정 필요) / Create video from specific date (code modification required)
# Edit the script to pass a custom folder path
```

## Configuration

`auto-snapshot.js` 파일을 수정하여 다음 설정을 변경할 수 있습니다:
You can modify the following settings by editing the `auto-snapshot.js` file:

- 캡처 간격 (기본: 30초) / Capture interval (default: 30 seconds)
- 저장 경로 / Save path
- 웹캠 해상도 / Webcam resolution
- 타임랩스 프레임레이트 (기본: 33fps) / Timelapse framerate (default: 33fps)

## License

MIT

---

💡 **Tip**
장시간 작업 후 `Ctrl+C`로 종료하면 자동으로 타임랩스 영상이 생성됩니다!
영상만 따로 만들고 싶다면 `node auto-snapshot.js video` 명령어를 사용하세요.

When you stop with `Ctrl+C` after a long work session, a timelapse video is automatically created!
If you only want to create a video, use the `node auto-snapshot.js video` command.
