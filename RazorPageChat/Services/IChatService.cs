using System.Collections.Generic;
using System.Threading.Tasks;

namespace RazorPageChat.Services
{
    public class ChatMessage
    {
        public string Role { get; set; }
        public string Content { get; set; }
    }

    public class ChatConfig
    {
        public string ApiKey { get; set; }
        public string Endpoint { get; set; }
        public string ModelId { get; set; }
    }

    public interface IChatService
    {
        Task<string> GetChatCompletionAsync(List<ChatMessage> messages, ChatConfig config);
        Task<IAsyncEnumerable<string>> GetChatCompletionStreamAsync(List<ChatMessage> messages, ChatConfig config);
    }
} 