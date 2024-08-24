<!-- src/client/src/App.svelte -->
<script>
    import { Router, Link, Route } from 'svelte-routing';
    import Index from './routes/index.svelte';
    import Settings from './routes/settings.svelte';
</script>

<main>
    <Router>
        <nav>
            <Link to="/">Home</Link>
            <Link to="/settings">Settings</Link>
        </nav>
        <div class="main">
        <Route path="/" component={Index} />
        <Route path="/settings" component={Settings} />
        </div>
    </Router>
</main>

<style>
    
    .main {
        width: 800px;
        margin: 0 auto;
    }
    nav {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    nav a {
        text-decoration: none;
        color: blue;
    }
</style>
