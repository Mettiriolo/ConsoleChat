using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using AvaloniaChat.Models;
using AvaloniaChat.Services;
using Microsoft.SemanticKernel;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AvaloniaChat
{
    public partial class MainWindow : Window
    {
        private readonly ObservableCollection<ChatMessage> _messages = [];
        private readonly IChatService _chatService;

        public MainWindow()
        {
            InitializeComponent();

            // 设置ItemsControl的数据源
            ChatMessages.ItemsSource = _messages;

            // 初始化Semantic Kernel
            var builder = Kernel.CreateBuilder();

            var config =  ConfigService.ListAsync().GetAwaiter().GetResult();

            string apiKey = config.Single(x => x.Key == "ApiKey").Value;
            string apiUri = config.Single(x => x.Key == "Endpoint").Value;
            string modelId = config.Single(x => x.Key == "ModelId").Value;
            _chatService = new SemanticKernelChatService(apiKey, apiUri, modelId);

            // 添加欢迎消息
            _messages.Add(new ChatMessage(Sender.Assistant, $"你好！我是基于{modelId}的AI助手。有什么我可以帮助你的吗？"));
        }


        private async void OnSendButtonClick(object sender, RoutedEventArgs e)
        {
            await SendMessage();
        }

        private async void OnMessageInputKeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                await SendMessage();
            }
        }

        private async Task SendMessage()
        {
            string? userMessage = MessageInput.Text?.Trim();

            if (string.IsNullOrEmpty(userMessage))
                return;

            // 添加用户消息到聊天记录
            _messages.Add(new ChatMessage(Sender.User, userMessage));

            // 清空输入框
            MessageInput.Text = string.Empty;
            sendBtn.IsEnabled = false;
            try
            {
                // 添加AI回复到聊天记录
                _messages.Add(new ChatMessage(Sender.Assistant, string.Empty));

                // 使用Semantic Kernel获取AI回复
                var stream = _chatService.GetStreamResponse(userMessage);
                StringBuilder sb = new StringBuilder();
                await foreach (var chunk in stream)
                {
                    _messages[^1].Content += chunk;
                    sb.Append(chunk);
                }
                _chatService.AddAssistantMessage(sb.ToString());
            }
            catch (Exception ex)
            {
                // 处理错误
                _messages.Add(new ChatMessage(Sender.System, $"发生错误: {ex.Message}"));
            }
            finally
            { 
                sendBtn.IsEnabled = true;
            }
        }
    }
} 