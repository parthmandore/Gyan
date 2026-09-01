import whisper

model = whisper.load_model("base")

result = model.transcribe(
    "sample_inputs/input1.ogg",
    language="en"
)

print("Recognized text:")
print(result["text"])
