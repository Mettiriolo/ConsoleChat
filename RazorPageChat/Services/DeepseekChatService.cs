using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace RazorPageChat.Services
{
    public class DeepseekChatService : IChatService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public DeepseekChatService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<string> GetChatCompletionAsync(List<ChatMessage> messages, ChatConfig config)
        {
            var client = _httpClientFactory.CreateClient();
            
            var request = CreateRequestMessage(messages, config);
            
            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var responseObject = JsonSerializer.Deserialize<JsonElement>(responseContent);
            
            return responseObject.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        }

        public async Task<IAsyncEnumerable<string>> GetChatCompletionStreamAsync(List<ChatMessage> messages, ChatConfig config)
        {
            throw new NotImplementedException("流式API还未实现");
        }

        private HttpRequestMessage CreateRequestMessage(List<ChatMessage> messages, ChatConfig config)
        {
            var apiMessages = messages.ConvertAll(m => new 
            {
                role = m.Role,
                content = m.Content
            });

            var requestBody = new
            {
                model = config.ModelId,
                messages = apiMessages,
                temperature = 0.7,
                max_tokens = 2000
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, config.Endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", config.ApiKey);
            request.Content = content;

            return request;
        }
    }
} 