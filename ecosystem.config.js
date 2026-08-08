// PM2 process definitions for running the stack directly on a host (no Docker).
//
// Note: these bind the same ports as docker compose (8000, 3000), so the two
// cannot run at the same time. `make dev` starts only the database container and
// expects you to run these against it.
//
// Both apps were previously unstartable: the backend's `script` resolved relative
// to `cwd`, pointing at a `backend/scripts/start-backend.sh` that did not exist,
// and the frontend used pm2's cluster mode with `script: 'npm'` - cluster mode
// requires a Node entrypoint and cannot fork a shell wrapper.
module.exports = {
  apps: [
    {
      name: 'tourism-backend',
      // `uv run` resolves the locked environment; no venv activation needed.
      script: 'uv',
      args: 'run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload',
      cwd: './backend',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        ENVIRONMENT: 'development',
      },
      env_production: {
        ENVIRONMENT: 'production',
      },
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      time: true,
    },
    {
      name: 'tourism-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './frontend',
      interpreter: 'none',
      instances: 1,
      // fork, not cluster: pm2's cluster module cannot fork `npm`.
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      time: true,
    },
  ],
};
