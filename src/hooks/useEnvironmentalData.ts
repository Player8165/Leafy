import { useState, useEffect } from "react";

export interface EnvironmentalData {
    temp: number;
    humidity: number;
    location?: string;
    loading: boolean;
}

export function useEnvironmentalData() {
    const [data, setData] = useState<EnvironmentalData>({
        temp: 24,
        humidity: 62,
        loading: true
    });

    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`
                );
                const weatherData = await response.json();
                
                if (weatherData.current) {
                    setData({
                        temp: Math.round(weatherData.current.temperature_2m),
                        humidity: Math.round(weatherData.current.relative_humidity_2m),
                        loading: false
                    });
                }
            } catch (error) {
                console.error("Weather fetch failed:", error);
                setData(prev => ({ ...prev, loading: false }));
            }
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    // Fallback to simulation if location denied
                    setData(prev => ({ ...prev, loading: false }));
                }
            );
        } else {
            setData(prev => ({ ...prev, loading: false }));
        }

        // Slight simulation flicker for realism
        const interval = setInterval(() => {
            setData(prev => ({
                ...prev,
                temp: prev.temp + (Math.random() > 0.5 ? 0.1 : -0.1),
                humidity: prev.humidity + (Math.random() > 0.5 ? 0.2 : -0.2)
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return data;
}
