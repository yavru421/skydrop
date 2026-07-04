using Microsoft.JSInterop;
using System;
using System.Threading.Tasks;

namespace sky_drop.Services
{
    public class FileBridgeService : IAsyncDisposable
    {
        private readonly IJSRuntime _jsRuntime;
        private DotNetObjectReference<FileBridgeService>? _dotNetRef;

        public event Action<string>? OnPeerIdGenerated;
        public event Action? OnConnected;
        public event Action? OnDisconnected;
        public event Action<int>? OnTransferProgress;
        public event Action? OnTransferComplete;

        public FileBridgeService(IJSRuntime jsRuntime)
        {
            _jsRuntime = jsRuntime;
            _dotNetRef = DotNetObjectReference.Create(this);
        }

        public async Task InitializeAsync()
        {
            await _jsRuntime.InvokeVoidAsync("fileBridge.initialize", _dotNetRef);
        }

        public async Task ConnectToPeerAsync(string peerId)
        {
            await _jsRuntime.InvokeVoidAsync("fileBridge.connectToPeer", peerId);
        }

        [JSInvokable]
        public void TriggerPeerIdGenerated(string peerId) => OnPeerIdGenerated?.Invoke(peerId);

        [JSInvokable]
        public void TriggerConnected() => OnConnected?.Invoke();

        [JSInvokable]
        public void TriggerDisconnected() => OnDisconnected?.Invoke();

        [JSInvokable]
        public void TriggerTransferProgress(int percentage) => OnTransferProgress?.Invoke(percentage);

        [JSInvokable]
        public void TriggerTransferComplete() => OnTransferComplete?.Invoke();

        public async ValueTask DisposeAsync()
        {
            if (_dotNetRef != null)
            {
                _dotNetRef.Dispose();
                _dotNetRef = null;
            }
            await _jsRuntime.InvokeVoidAsync("fileBridge.dispose");
        }
    }
}
