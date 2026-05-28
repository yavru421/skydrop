using Microsoft.JSInterop;

namespace BlazorPwaTemplate.Services;

public class TunerService : ITunerService
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;

    private static readonly List<TuningPreset> _presets = new()
    {
        new TuningPreset
        {
            Name = "Standard (E A D G B E)",
            Instrument = "Guitar",
            Strings = new()
            {
                new() { Name = "6", Note = "E", Octave = 2, Frequency = 82.41 },
                new() { Name = "5", Note = "A", Octave = 2, Frequency = 110.00 },
                new() { Name = "4", Note = "D", Octave = 3, Frequency = 146.83 },
                new() { Name = "3", Note = "G", Octave = 3, Frequency = 196.00 },
                new() { Name = "2", Note = "B", Octave = 3, Frequency = 246.94 },
                new() { Name = "1", Note = "E", Octave = 4, Frequency = 329.63 },
            }
        },
        new TuningPreset
        {
            Name = "Drop D (D A D G B E)",
            Instrument = "Guitar",
            Strings = new()
            {
                new() { Name = "6", Note = "D", Octave = 2, Frequency = 73.42 },
                new() { Name = "5", Note = "A", Octave = 2, Frequency = 110.00 },
                new() { Name = "4", Note = "D", Octave = 3, Frequency = 146.83 },
                new() { Name = "3", Note = "G", Octave = 3, Frequency = 196.00 },
                new() { Name = "2", Note = "B", Octave = 3, Frequency = 246.94 },
                new() { Name = "1", Note = "E", Octave = 4, Frequency = 329.63 },
            }
        },
        new TuningPreset
        {
            Name = "Open G (D G D G B D)",
            Instrument = "Guitar",
            Strings = new()
            {
                new() { Name = "6", Note = "D", Octave = 2, Frequency = 73.42 },
                new() { Name = "5", Note = "G", Octave = 2, Frequency = 98.00 },
                new() { Name = "4", Note = "D", Octave = 3, Frequency = 146.83 },
                new() { Name = "3", Note = "G", Octave = 3, Frequency = 196.00 },
                new() { Name = "2", Note = "B", Octave = 3, Frequency = 246.94 },
                new() { Name = "1", Note = "D", Octave = 4, Frequency = 293.66 },
            }
        },
        new TuningPreset
        {
            Name = "Standard (E A D G)",
            Instrument = "Bass",
            Strings = new()
            {
                new() { Name = "4", Note = "E", Octave = 1, Frequency = 41.20 },
                new() { Name = "3", Note = "A", Octave = 1, Frequency = 55.00 },
                new() { Name = "2", Note = "D", Octave = 2, Frequency = 73.42 },
                new() { Name = "1", Note = "G", Octave = 2, Frequency = 98.00 },
            }
        },
        new TuningPreset
        {
            Name = "Standard (G C E A)",
            Instrument = "Ukulele",
            Strings = new()
            {
                new() { Name = "4", Note = "G", Octave = 4, Frequency = 392.00 },
                new() { Name = "3", Note = "C", Octave = 4, Frequency = 261.63 },
                new() { Name = "2", Note = "E", Octave = 4, Frequency = 329.63 },
                new() { Name = "1", Note = "A", Octave = 4, Frequency = 440.00 },
            }
        },
        new TuningPreset
        {
            Name = "Standard (G D A E)",
            Instrument = "Violin",
            Strings = new()
            {
                new() { Name = "4", Note = "G", Octave = 3, Frequency = 196.00 },
                new() { Name = "3", Note = "D", Octave = 4, Frequency = 293.66 },
                new() { Name = "2", Note = "A", Octave = 4, Frequency = 440.00 },
                new() { Name = "1", Note = "E", Octave = 5, Frequency = 659.25 },
            }
        },
    };

    public TunerService(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./js/tuner.module.js").AsTask());
    }

    public async Task<bool> IsSupportedAsync()
    {
        var m = await _moduleTask.Value;
        return await m.InvokeAsync<bool>("isSupported");
    }

    public async Task<bool> StartTunerAsync(DotNetObjectReference<object> helper, string callbackName)
    {
        var m = await _moduleTask.Value;
        return await m.InvokeAsync<bool>("startTuner", helper, callbackName);
    }

    public async Task StopTunerAsync()
    {
        var m = await _moduleTask.Value;
        await m.InvokeVoidAsync("stopTuner");
    }

    public async Task PlayToneAsync(double frequency, string waveform = "sine")
    {
        var m = await _moduleTask.Value;
        await m.InvokeVoidAsync("playTone", frequency, waveform);
    }

    public async Task StopToneAsync()
    {
        var m = await _moduleTask.Value;
        await m.InvokeVoidAsync("stopTone");
    }

    public async Task StartMetronomeAsync(int bpm, int beatsPerMeasure, DotNetObjectReference<object> helper, string beatCallback)
    {
        var m = await _moduleTask.Value;
        await m.InvokeVoidAsync("startMetronome", bpm, beatsPerMeasure, helper, beatCallback);
    }

    public async Task StopMetronomeAsync()
    {
        var m = await _moduleTask.Value;
        await m.InvokeVoidAsync("stopMetronome");
    }

    public IReadOnlyList<TuningPreset> GetPresets() => _presets;

    public async ValueTask DisposeAsync()
    {
        if (_moduleTask.IsValueCreated)
        {
            var m = await _moduleTask.Value;
            await m.DisposeAsync();
        }
    }
}
