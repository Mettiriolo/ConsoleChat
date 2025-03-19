using System.ComponentModel;

namespace AvaloniaChat.Models
{
    public class ChatMessage(Sender sender, string content) : INotifyPropertyChanged
    {
        public Sender Sender { get; set; } = sender;

        public string Content
        {
            get => content;
            set
            {
                if (content != value)
                {
                    content = value;
                    OnPropertyChanged(nameof(Content));
                }
            }
        }

        public bool IsUser { get; set; } = sender.Label == "”√ªß";

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
} 