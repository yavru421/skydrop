using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using BlazorPwaTemplate;
using BlazorPwaTemplate.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

// State
builder.Services.AddSingleton<AppStateContainer>();

// Services
builder.Services.AddScoped<ClipboardService>();
builder.Services.AddScoped<IClipboardService>(sp => sp.GetRequiredService<ClipboardService>());
builder.Services.AddScoped<ILocalStorageService, LocalStorageService>();
builder.Services.AddSingleton<IPwaInstallService, PwaInstallService>();
builder.Services.AddSingleton<IToastService, ToastService>();
builder.Services.AddScoped<IThemeService, ThemeService>();
builder.Services.AddScoped<IChartService, ChartService>();
builder.Services.AddScoped<IGestureService, GestureService>();
builder.Services.AddScoped<SyncService>();

// Tuner
builder.Services.AddScoped<ITunerService, TunerService>();
builder.Services.AddScoped<IStudioService, StudioService>();

await builder.Build().RunAsync();
