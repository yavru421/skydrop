using Microsoft.JSInterop;

namespace BlazorPwaTemplate.Services;

public class StudioService : IStudioService, IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;

    public StudioService(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./js/studio.module.js").AsTask());
    }

    public async Task InitStudioAsync(DotNetObjectReference<object> helper, string callbackName)
    {
        var m = await _moduleTask.Value;
        await m.InvokeVoidAsync("initStudio", helper, callbackName);
    }

    public async Task StartPlayAsync(bool[][] grid, double[] melody, int bpm)
    {
        var m = await _moduleTask.Value;
        await m.InvokeVoidAsync("startPlay", grid, melody, bpm);
    }

    public async Task StopPlayAsync()
    {
        var m = await _moduleTask.Value;
        await m.InvokeVoidAsync("stopPlay");
    }

    public async Task UpdateStateAsync(bool[][] grid, double[] melody, int bpm)
    {
        var m = await _moduleTask.Value;
        await m.InvokeVoidAsync("updateState", grid, melody, bpm);
    }

    public async ValueTask DisposeAsync()
    {
        if (_moduleTask.IsValueCreated)
        {
            var m = await _moduleTask.Value;
            await m.DisposeAsync();
        }
    }
}
