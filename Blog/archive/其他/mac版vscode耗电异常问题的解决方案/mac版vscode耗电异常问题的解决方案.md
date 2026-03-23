`command + shift + p`展开上方输入栏.
输入`Preferences: Configure Runtime Arguments`并打开.
找到
```
    // Use software rendering instead of hardware accelerated rendering.
	// This can help in cases where you see rendering issues in VS Code.
	// "disable-hardware-acceleration": true,
```
删除`"disable-hardware-acceleration": true,`前的注释后, 保存并重启vscode.
