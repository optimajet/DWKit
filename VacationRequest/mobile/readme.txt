DWKit Mobile Frontend

How to start
-------------------
1. Install tools
For Android:
- Android Studio: https://developer.android.com/studio
- ADB: brew cask install android-platform-tools or https://www.xda-developers.com/install-adb-windows-macos-linux/
- JDK: brew cask install adoptopenjdk/openjdk/adoptopenjdk8 or https://docs.oracle.com/en/java/javase/11/install/installation-jdk-microsoft-windows-platforms.html
- Android emulator: https://developer.android.com/studio/run/managing-avds

For iOS you need to install XCode

2. Install dependencies
2.1 Open "mobile" folder and run install-deps.ps1 script
	For MacOSX/Linux: 
		pwsh ./install-deps.ps1
		pwsh ./install-ios.ps1
	For Windows: powershell install-deps.ps1
2.2. Run Android
2.2.1. Open mobile/android in Android Studio and build it
2.2.2. Run chmod +x android/gradlew (For Linux/MacOS only)
2.2.3. Physical devices: react-native start
2.2.4. Emulator in Windows: npm run android
2.2.5. Emulator Linux: npm run android-linux or npm run android (for Windows)
2.3. Run iOS (it works for MacOSX only!)
	npm run ios

For some cases you need to clear Android files:
cd android && ./gradlew clean

How to Debug
-------------------
1. Install React Native Debugger: https://github.com/jhen0409/react-native-debugger.
2. Run React Native Debugger and an emulator. 
3. You need to switch debug mode on for the emulator.
- For iOS press Cmd + D
- For Android in Metro terminal press R.
4. In the mobile interface choose Debug.
For more information: https://reactnative.dev/docs/debugging


How to build APK (Android)
-------------------
Place your terminal directory to android using:
cd android
Then run the following command
For Windows,
gradlew assembleRelease

For Linux and Mac OSX:
./gradlew assembleRelease
Check the apk in -> android/app/build/outputs/apk/release/app-release.apk

How to build iOS package
-------------------
Open ios folder in xCode and build the project