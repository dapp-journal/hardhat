# hardhat

## 调试合约
```bash
npx hardhat test
```

调试合约会自动编译


## 部署到本地测试链

1. 启动本地链

```bash
npx hardhat node
```

2. 部署

```bash
npx hardhat ignition deploy ./ignition/modules/KeywordManager.ts --network localhost
```

