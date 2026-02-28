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
