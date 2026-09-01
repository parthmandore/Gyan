from assessment import assess_reading


expected = "The Sun rises in the east."

recognized = "The Moon rises west."


result = assess_reading(
    expected,
    recognized
)

print(result)