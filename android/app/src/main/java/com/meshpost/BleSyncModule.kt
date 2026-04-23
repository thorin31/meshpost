package com.meshpost

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BleSyncModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "BleSyncModule"

    @ReactMethod
    fun startService() {
        val intent = Intent(reactContext, BleSyncService::class.java).apply {
            action = BleSyncService.ACTION_START
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    @ReactMethod
    fun stopService() {
        val intent = Intent(reactContext, BleSyncService::class.java).apply {
            action = BleSyncService.ACTION_STOP
        }
        reactContext.startService(intent)
    }
}
