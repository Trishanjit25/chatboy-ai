# from openai import OpenAI

# client = OpenAI(
#   base_url="https://openrouter.ai/api/v1",
#   api_key="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",
# )

# completion = client.chat.completions.create(
#   model="openai/gpt-oss-120b:free",
#   messages=[
#     {
#       "role": "user",
#       "content": "What is the meaning of life?"
#     }
#   ]
# )

# print(completion.choices[0].message.content)


from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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")   # ⚠️ Never expose real keys publicly


# Take user input
user_input = input("Ask something: ")

completion = client.chat.completions.create(
    model="openai/gpt-oss-120b:free",
    messages=[
        {
            "role": "user",
            "content": user_input
        }
    ]
)

# Print response
print("\nAI Reply:")
print(completion.choices[0].message.content)
