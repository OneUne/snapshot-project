# Auto Snapshot

> 일하는 동안 내 모습이 궁금하지 않으셨나요?
> Have you ever wondered how you look while you're working?

화면과 웹캠을 자동으로 캡처하여 작업 중 내 모습을 기록하는 도구입니다.

A tool that automatically captures your screen and webcam to record how you look while working.

## Features

- 🖥️ **화면 캡처** - 전체 화면 또는 특정 창을 자동으로 스크린샷
- 📸 **웹캠 캡처** - 작업 중인 당신의 모습을 자동으로 촬영
- ⏰ **자동 실행** - 설정된 간격으로 자동으로 스냅샷 생성
- 📁 **자동 정리** - 날짜별로 폴더에 정리되어 저장

## Platform

⚠️ **macOS only** - 현재 macOS에서만 동작합니다.

이 도구는 macOS의 `screencapture` 명령어를 사용하기 때문에 macOS 환경에서만 작동합니다.

This tool uses macOS's `screencapture` command, so it only works on macOS.

## Installation

```bash
# Clone this repository
git clone https://github.com/YOUR_USERNAME/snapshot-project.git
cd snapshot-project

# Node.js가 설치되어 있는지 확인
node --version
```

## Usage

```bash
node auto-snapshot.js
```

스냅샷은 `snapshots/YYYY-MM-DD/` 폴더에 저장됩니다.

Snapshots are saved in the `snapshots/YYYY-MM-DD/` folder.

## Configuration

`auto-snapshot.js` 파일을 수정하여 다음 설정을 변경할 수 있습니다:

You can modify the following settings by editing the `auto-snapshot.js` file:

- 캡처 간격 (Capture interval)
- 저장 경로 (Save path)
- 스크린샷 형식 (Screenshot format)

## License

MIT

---

💡 **Tip**: 장시간 작업 후 타임랩스 영상을 만들어보세요!
After a long work session, try creating a timelapse video!
