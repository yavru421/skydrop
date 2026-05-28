using Microsoft.JSInterop;

namespace BlazorPwaTemplate.Services;

public record TunerReading
{
    public double Frequency { get; init; }
    public string Note { get; init; } = "--";
    public int Octave { get; init; }
    public int Cents { get; init; }
    public double TargetFrequency { get; init; }
    public double Rms { get; init; }
}

public record InstrumentString
{
    public string Name { get; init; } = "";
    public string Note { get; init; } = "";
    public int Octave { get; init; }
    public double Frequency { get; init; }
}

public record TuningPreset
{
    public string Name { get; init; } = "";
    public string Instrument { get; init; } = "";
    public List<InstrumentString> Strings { get; init; } = new();
}

public interface ITunerService : IAsyncDisposable
{
    Task<bool> IsSupportedAsync();
    Task<bool> StartTunerAsync(DotNetObjectReference<object> helper, string callbackName);
    Task StopTunerAsync();
    Task PlayToneAsync(double frequency, string waveform = "sine");
    Task StopToneAsync();
    Task StartMetronomeAsync(int bpm, int beatsPerMeasure, DotNetObjectReference<object> helper, string beatCallback);
    Task StopMetronomeAsync();
    IReadOnlyList<TuningPreset> GetPresets();
}
