from audio_analysis import analyze_audio


audio_path = r"..\..\sample_inputs\input1.ogg"

recognized_text = "The Sun rises east."

result = analyze_audio(
    audio_path,
    recognized_text
)

print(result)