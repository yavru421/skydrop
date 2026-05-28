using Microsoft.JSInterop;

namespace BlazorPwaTemplate.Services;

public interface IStudioService
{
    Task InitStudioAsync(DotNetObjectReference<object> helper, string callbackName);
    Task StartPlayAsync(bool[][] grid, double[] melody, int bpm);
    Task StopPlayAsync();
    Task UpdateStateAsync(bool[][] grid, double[] melody, int bpm);
}
