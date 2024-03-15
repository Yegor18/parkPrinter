
const routes = [
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{ path: '', component: () => import('pages/IndexPage.vue') },
			//*** переход на страницу с настройками
			{ path: '/settings', component: () => import('pages/SettingsPage.vue') }
		]
	}
]

export default routes
